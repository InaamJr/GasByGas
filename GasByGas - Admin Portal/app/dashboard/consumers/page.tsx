'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  FileText, 
  Calendar,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Store,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GasRequest {
  request_id: number;
  outlet_id: number;
  outlet_name: string;
  request_date: string;
  expected_pickup_date: string;
  status: string;
  reallocation_status: string;
  token_no?: string;
  token_status?: string;
  token_expiry?: string;
  details: {
    cylinder_type: string;
    weight_kg: number;
    quantity: number;
  }[];
}

interface Consumer {
  consumer_id: number;
  name: string;
  nic: string;
  email: string;
  contact_no: string;
  consumer_type: 'general' | 'business';
  joined_date: string;
  status: 'active' | 'inactive';
  business_name?: string;
  business_reg_no?: string;
  certification_document?: string;
  verification_status?: 'pending' | 'accepted' | 'rejected';
  verification_date?: string;
}

export default function ConsumersPage() {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [filteredConsumers, setFilteredConsumers] = useState<Consumer[]>([]);
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
  const [gasRequests, setGasRequests] = useState<GasRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchConsumers();
  }, [refreshTrigger]);

  useEffect(() => {
    if (selectedConsumer) {
      fetchGasRequests(selectedConsumer.consumer_id);
    }
  }, [selectedConsumer]);

  const fetchConsumers = async () => {
    try {
      const response = await fetch('/api/consumers', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      if (!response.ok) throw new Error('Failed to fetch consumers');
      const data = await response.json();
      setConsumers(data);
      setFilteredConsumers(data);
    } catch (error) {
      console.error('Error fetching consumers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consumers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGasRequests = async (consumerId: number) => {
    try {
      const response = await fetch(`/api/consumers/${consumerId}/requests`);
      if (!response.ok) throw new Error('Failed to fetch gas requests');
      const data = await response.json();
      setGasRequests(data);
    } catch (error) {
      console.error('Error fetching gas requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load gas requests',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    filterConsumers();
  }, [consumers, searchTerm, selectedType, selectedStatus]);

  const filterConsumers = () => {
    let filtered = [...consumers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(consumer => 
        consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consumer.nic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(consumer => consumer.consumer_type === selectedType);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(consumer => consumer.status === selectedStatus);
    }

    setFilteredConsumers(filtered);
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (consumerId: number) => {
    try {
      const response = await fetch(`/api/consumers/${consumerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete consumer');
      }

      toast({
        title: 'Success',
        description: 'Consumer deleted successfully',
      });

      // Refresh data after deletion
      refreshData();
    } catch (error) {
      console.error('Error deleting consumer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete consumer',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gray-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Total Consumers</h3>
              <p className="text-3xl font-bold">
                {consumers.filter(c => 
                  c.consumer_type === 'general' || 
                  (c.consumer_type === 'business' && c.verification_status === 'accepted')
                ).length}
              </p>
            </div>
            <Users className="h-8 w-8" />
          </div>
        </Card>
        <Card className="p-6 bg-blue-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Business Consumers</h3>
              <p className="text-3xl font-bold">
                {consumers.filter(c => 
                  c.consumer_type === 'business' && 
                  c.verification_status === 'accepted'
                ).length}
              </p>
            </div>
            <Building2 className="h-8 w-8" />
          </div>
        </Card>
        <Card className="p-6 bg-green-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">General Consumers</h3>
              <p className="text-3xl font-bold">
                {consumers.filter(c => c.consumer_type === 'general').length}
              </p>
            </div>
            <User className="h-8 w-8" />
          </div>
        </Card>
        <Card className="p-6 bg-yellow-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Active Consumers</h3>
              <p className="text-3xl font-bold">
                {consumers.filter(c => 
                  (c.consumer_type === 'general' && c.status === 'active') ||
                  (c.consumer_type === 'business' && c.verification_status === 'accepted')
                ).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search consumers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={selectedType}
            onValueChange={setSelectedType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Consumers Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Consumers List</h2>
          </div>
          <div className="p-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIC</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConsumers.map((consumer) => (
                      <TableRow
                        key={consumer.consumer_id}
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => setSelectedConsumer(consumer)}
                      >
                        <TableCell className="font-medium">
                          {consumer.nic}
                        </TableCell>
                        <TableCell>{consumer.name}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            consumer.consumer_type === 'business'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {consumer.consumer_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            consumer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {consumer.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Consumer Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b p-4">
            <h2 className="text-xl font-semibold">Consumer Details</h2>
          </div>
          
          {selectedConsumer ? (
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <Card className="p-4 bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedConsumer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NIC</p>
                    <p className="font-medium">{selectedConsumer.nic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedConsumer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{selectedConsumer.contact_no}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Consumer Type</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedConsumer.consumer_type === 'business'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedConsumer.consumer_type}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedConsumer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedConsumer.status}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Business Information (if business consumer) */}
              {selectedConsumer.consumer_type === 'business' && (
                <Card className="p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5" />
                    Business Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium">{selectedConsumer.business_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="font-medium">{selectedConsumer.business_reg_no}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Verification Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedConsumer.verification_status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : selectedConsumer.verification_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedConsumer.verification_status}
                      </span>
                    </div>
                    {selectedConsumer.verification_date && (
                      <div>
                        <p className="text-sm text-gray-500">Verified On</p>
                        <p className="font-medium">
                          {new Date(selectedConsumer.verification_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedConsumer.certification_document && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Business Certificate</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Document
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Business Certificate</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 overflow-hidden">
                              <iframe
                                src={`/uploads/${selectedConsumer.certification_document}`}
                                className="w-full h-full"
                                title="Document Preview"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Gas Requests History */}
              <Card className="p-4 bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <History className="h-5 w-5" />
                  Gas Request History
                </h3>
                <div className="space-y-4">
                  {gasRequests.length > 0 ? (
                    <div className="grid gap-4">
                      {gasRequests.map((request) => (
                        <div key={request.request_id} className="flex flex-col p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Store className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="font-medium">{request.outlet_name}</p>
                                <p className="text-sm text-gray-500">
                                  Requested: {new Date(request.request_date).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Expected Pickup: {new Date(request.expected_pickup_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                request.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : request.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {request.status}
                              </span>
                              {request.token_no && (
                                <div className="text-right">
                                  <p className="text-xs font-medium text-blue-600">{request.token_no}</p>
                                  <p className="text-xs text-gray-500">
                                    Expires: {new Date(request.token_expiry!).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-sm font-medium mb-1">Order Details:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {request.details.map((detail, index) => (
                                <div key={index} className="text-sm">
                                  <span className="text-gray-600">{detail.quantity}x </span>
                                  <span className="font-medium">{detail.cylinder_type}</span>
                                  <span className="text-gray-500"> ({detail.weight_kg}kg)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No gas requests found</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a consumer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
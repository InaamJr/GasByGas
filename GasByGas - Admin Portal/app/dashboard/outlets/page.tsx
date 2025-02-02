'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Search, Store, User, Mail, Phone, MapPin, FileText, Calendar, CheckCircle, AlertCircle, Package2 } from 'lucide-react';
import { columns } from './columns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Stock {
  type_id: number;
  name: string;
  weight_kg: number;
  quantity: number;
  last_updated: string;
}

interface Outlet {
  outlet_id: number;
  outlet_name: string;
  district: string;
  status: string;
  manager_id: number;
  outlet_registration_id: string;
  manager_name: string;
  nic: string;
  email: string;
  contact_no: string;
  verification_status: string;
  verification_date: string | null;
  outlet_certificate?: string;
}

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [filteredOutlets, setFilteredOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [stockLevels, setStockLevels] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDocument, setShowDocument] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOutlets();
  }, []);

  useEffect(() => {
    if (selectedOutlet) {
      fetchStockLevels(selectedOutlet.outlet_id);
    }
  }, [selectedOutlet]);

  const fetchStockLevels = async (outletId: number) => {
    try {
      const response = await fetch(`/api/outlets/${outletId}/stock`);
      if (!response.ok) throw new Error('Failed to fetch stock levels');
      const data = await response.json();
      setStockLevels(data);
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stock levels',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    filterOutlets();
  }, [outlets, searchTerm, selectedDistrict, selectedStatus]);

  const fetchOutlets = async () => {
    try {
      const response = await fetch('/api/outlets');
      if (!response.ok) throw new Error('Failed to fetch outlets');
      const data = await response.json();
      setOutlets(data);
      setFilteredOutlets(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load outlets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOutlets = () => {
    let filtered = [...outlets];

    if (searchTerm) {
      filtered = filtered.filter(outlet =>
        outlet.outlet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outlet.outlet_registration_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        outlet.manager_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(outlet => outlet.district === selectedDistrict);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(outlet => outlet.status === selectedStatus);
    }

    setFilteredOutlets(filtered);
  };

  const districts = [...new Set(outlets.map(outlet => outlet.district))];

  const handleRowClick = (outlet: Outlet) => {
    setSelectedOutlet(outlet);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gray-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Total Outlets</h3>
              <p className="text-3xl font-bold">{outlets.length}</p>
            </div>
            <div className="text-4xl">🏪</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outlets Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">----- Outlets Table -----</h2>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search outlets..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select 
                value={selectedDistrict} 
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map(district => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration ID</TableHead>
                    <TableHead>Outlet Name</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredOutlets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No outlets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOutlets.map((outlet) => (
                      <TableRow
                        key={outlet.outlet_id}
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleRowClick(outlet)}
                      >
                        <TableCell className="font-medium">
                          {outlet.outlet_registration_id}
                        </TableCell>
                        <TableCell>{outlet.outlet_name}</TableCell>
                        <TableCell>{outlet.district}</TableCell>
                        <TableCell>{outlet.manager_name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            outlet.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {outlet.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            outlet.verification_status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : outlet.verification_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {outlet.verification_status}
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

        {/* Enhanced Outlet Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b p-4">
            <h2 className="text-xl font-semibold">Outlet Details</h2>
          </div>
          
          {selectedOutlet ? (
            <div className="p-6 space-y-6">
              {/* Outlet Information */}
              <Card className="p-4 bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Store className="h-5 w-5" />
                  Outlet Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedOutlet.outlet_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="font-medium">{selectedOutlet.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration ID</p>
                    <p className="font-medium">{selectedOutlet.outlet_registration_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedOutlet.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedOutlet.status}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Manager Information */}
              <Card className="p-4 bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  Manager Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedOutlet.manager_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">NIC</p>
                      <p className="font-medium">{selectedOutlet.nic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedOutlet.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{selectedOutlet.contact_no}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Verification Status */}
              <Card className="p-4 bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5" />
                  Verification Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedOutlet.verification_status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : selectedOutlet.verification_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedOutlet.verification_status}
                    </span>
                  </div>
                  {selectedOutlet.verification_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Verified On</p>
                        <p className="font-medium">
                          {new Date(selectedOutlet.verification_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Stock Levels */}
              <Card className="p-4 bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Package2 className="h-5 w-5" />
                  Current Stock Levels
                </h3>
                <div className="space-y-4">
                  {stockLevels.length > 0 ? (
                    <div className="grid gap-4">
                      {stockLevels.map((stock) => (
                        <div key={stock.type_id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <Package2 className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{stock.name}</p>
                              <p className="text-sm text-gray-500">{stock.weight_kg}kg cylinder</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{stock.quantity}</p>
                            <p className="text-xs text-gray-500">
                              Last updated: {new Date(stock.last_updated).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <Package2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No stock information available</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Document Section */}
              <Card className="p-4 bg-gray-50">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5" />
                  Submitted Documents
                </h3>
                {selectedOutlet.outlet_certificate ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Registration Certificate</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          View Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Registration Certificate</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-hidden">
                          <iframe
                            src={`/uploads/${selectedOutlet.outlet_certificate}`}
                            className="w-full h-full"
                            title="Document Preview"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>No documents available</span>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an outlet to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
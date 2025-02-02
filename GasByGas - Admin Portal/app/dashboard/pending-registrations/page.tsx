'use client';

import { useState, useEffect } from 'react';
import { Store, Building2, FileText, Phone, Mail, MapPin, User, Calendar, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const outletColumns = [
  { 
    key: 'outlet_name', 
    label: 'Outlet Name',
    render: (value: string) => (
      <div className="flex items-center space-x-2">
        <Store className="w-4 h-4" />
        <span>{value}</span>
      </div>
    )
  },
  { 
    key: 'outlet_registration_id', 
    label: 'Registration ID',
    render: (value: string) => (
      <div className="flex items-center space-x-2">
        <FileText className="w-4 h-4" />
        <span>{value}</span>
      </div>
    )
  },
  { 
    key: 'manager_name', 
    label: 'Manager',
    render: (value: string, row: any) => (
      <div className="space-y-1">
        <div>{value}</div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Phone className="w-3 h-3" />
          <span>{row.contact_no}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Mail className="w-3 h-3" />
          <span>{row.email}</span>
        </div>
      </div>
    )
  },
  {
    key: 'outlet_address',
    label: 'Address',
    render: (value: string) => (
      <div className="flex items-center space-x-2">
        <MapPin className="w-4 h-4" />
        <span>{value}</span>
      </div>
    )
  }
];

const businessColumns = [
  { 
    key: 'business_name', 
    label: 'Business Name',
    render: (value: string) => (
      <div className="flex items-center space-x-2">
        <Building2 className="w-4 h-4" />
        <span>{value}</span>
      </div>
    )
  },
  { 
    key: 'business_reg_no', 
    label: 'Registration No',
    render: (value: string) => (
      <div className="flex items-center space-x-2">
        <FileText className="w-4 h-4" />
        <span>{value}</span>
      </div>
    )
  },
  { 
    key: 'manager_name', 
    label: 'Manager',
    render: (value: string, row: any) => (
      <div className="space-y-1">
        <div>{value}</div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Phone className="w-3 h-3" />
          <span>{row.contact_no}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Mail className="w-3 h-3" />
          <span>{row.email}</span>
        </div>
      </div>
    )
  }
];

export default function PendingRegistrationsPage() {
  const [outlets, setOutlets] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [district, setDistrict] = useState('');
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyAction, setVerifyAction] = useState<{ 
    id: number; 
    type: 'outlet' | 'business'; 
    status: 'accepted' | 'rejected';
    address?: string;
  } | null>(null);
  const { toast } = useToast();
  const { data: session } = useSession();

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      console.log('Fetching pending registrations...');
      const response = await fetch('/api/pending-registrations');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch pending registrations: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.outlets || !data.businesses) {
        throw new Error('Invalid response format');
      }
      
      setOutlets(data.outlets);
      setBusinesses(data.businesses);
      console.log('State updated:', { outlets: data.outlets, businesses: data.businesses });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load pending registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const extractDistrictFromAddress = (address: string) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts[parts.length - 1].trim();
  };

  const initiateVerification = (id: number, type: 'outlet' | 'business', status: 'accepted' | 'rejected', item: any) => {
    if (type === 'outlet' && status === 'accepted') {
      const extractedDistrict = extractDistrictFromAddress(item.outlet_address || '');
      setDistrict(extractedDistrict);
      setVerifyAction({ id, type, status, address: item.outlet_address });
      setShowVerifyDialog(true);
    } else {
      handleVerification(id, type, status);
    }
  };

  const handleVerification = async (id: number, type: 'outlet' | 'business', status: 'accepted' | 'rejected', district?: string) => {
    try {
      const requestBody: any = {
        status,
        admin_id: 6, // Temporarily use admin ID 6 until we fix the session
        registrationType: type
      };

      if (type === 'outlet' && status === 'accepted') {
        if (!district) {
          throw new Error('District is required for accepting outlet registration');
        }
        requestBody.district = district;
      }

      const response = await fetch(`/api/pending-registrations/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update verification status');
      }

      toast({
        title: 'Success',
        description: `${type === 'business' ? 'Business' : 'Outlet'} registration ${status} successfully`,
      });

      fetchPendingRegistrations();
      setShowVerifyDialog(false);
      setDistrict('');
      setVerifyAction(null);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error during verification:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update verification status',
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = () => {
    setShowVerifyDialog(false);
    setVerifyAction(null);
    setDistrict('');
  };

  const handleDialogConfirm = () => {
    if (verifyAction) {
      handleVerification(verifyAction.id, verifyAction.type, verifyAction.status, district);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <StatCard
          title="Pending Outlet Registrations"
          value={outlets.length}
          icon={Store}
        />
        <StatCard
          title="Pending Business Registrations"
          value={businesses.length}
          icon={Building2}
        />
      </div>

      <Card>
        <Tabs defaultValue="outlets" className="p-6">
          <TabsList className="mb-4">
            <TabsTrigger value="outlets">Outlets</TabsTrigger>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
          </TabsList>

          <TabsContent value="outlets">
            <DataTable
              data={outlets}
              columns={outletColumns}
              loading={loading}
              onRowClick={setSelectedItem}
            />
          </TabsContent>

          <TabsContent value="businesses">
            <DataTable
              data={businesses}
              columns={businessColumns}
              loading={loading}
              onRowClick={setSelectedItem}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem.outlet_name ? 'Outlet Registration Details' : 'Business Registration Details'}
              </DialogTitle>
              <DialogDescription>
                Review the registration details before making a decision
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {selectedItem.outlet_name ? <Store className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      <span className="font-medium">
                        {selectedItem.outlet_name || selectedItem.business_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>
                        Registration ID: {selectedItem.outlet_registration_id || selectedItem.business_reg_no}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{selectedItem.manager_name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{selectedItem.contact_no}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{selectedItem.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedItem.outlet_address || selectedItem.business_address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Applied on: {new Date(selectedItem.joined_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-4 h-4" />
                      <span>NIC: {selectedItem.nic}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Submitted Documents</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>
                        {selectedItem.document_status === 'Available' ? 
                          (selectedItem.outlet_name ? 'Outlet Certificate' : 'Business Certificate') : 
                          'No Document'
                        }
                      </span>
                      <Badge variant={selectedItem.document_status === 'Available' ? 'default' : 'destructive'}>
                        {selectedItem.document_status}
                      </Badge>
                    </div>
                    {selectedItem.document_status === 'Available' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const endpoint = selectedItem.outlet_name
                              ? `/api/pending-registrations/outlet/${selectedItem.manager_id}/document`
                              : `/api/pending-registrations/business/${selectedItem.consumer_id}/document`;
                            
                            const response = await fetch(endpoint);
                            
                            if (!response.ok) {
                              throw new Error('Failed to fetch document');
                            }
                            
                            // Check if we received a PDF
                            const contentType = response.headers.get('content-type');
                            if (!contentType || !contentType.includes('application/pdf')) {
                              throw new Error('Invalid document format');
                            }
                            
                            // Create blob and open in new window
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            window.open(url, '_blank');
                          } catch (error) {
                            console.error('Error viewing document:', error);
                            toast({
                              title: 'Error',
                              description: 'Failed to view document. Please try again.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        View Document
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="default"
                  onClick={() => initiateVerification(
                    selectedItem.manager_id || selectedItem.consumer_id,
                    selectedItem.outlet_name ? 'outlet' : 'business',
                    'accepted',
                    selectedItem
                  )}
                >
                  Accept Registration
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => initiateVerification(
                    selectedItem.manager_id || selectedItem.consumer_id,
                    selectedItem.outlet_name ? 'outlet' : 'business',
                    'rejected',
                    selectedItem
                  )}
                >
                  Reject Registration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showVerifyDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm District</DialogTitle>
            <DialogDescription>
              Please confirm or modify the district extracted from the address.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter district name"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
            {verifyAction?.address && (
              <p className="mt-2 text-sm text-gray-500">
                Full Address: {verifyAction.address}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleDialogConfirm} disabled={!district.trim()}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

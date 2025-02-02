'use client';

import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';

const outletColumns = [
  { key: 'Outlet_Name', label: 'Name' },
  { key: 'Manager_Name', label: 'Manager' },
  { key: 'Contact_No', label: 'Contact' },
  { 
    key: 'status',
    label: 'Status',
    render: (value: string) => {
      if (!value) return null;
      return (
        <span className={`px-2 py-1 rounded-full text-sm ${
          value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      );
    }
  }
];

const businessColumns = [
  { key: 'Business_Name', label: 'Business Name' },
  { key: 'Name', label: 'Owner Name' },
  { key: 'ContactNo', label: 'Contact' }
];

interface Request {
  type: 'outlet' | 'business';
  Manager_ID?: number;
  ConsumerID?: number;
  Outlet_Name?: string;
  Business_Name?: string;
  Manager_Name?: string;
  Name?: string;
  Contact_No?: string;
  ContactNo?: string;
  Email?: string;
  has_certificate?: boolean;
  has_document?: boolean;
  status?: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<{ outletRequests: Request[], businessRequests: Request[] }>({
    outletRequests: [],
    businessRequests: []
  });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      
      // Log the data to see what we're getting
      console.log('Fetched data:', data);
      
      // Transform the data to ensure all fields are properly handled
      const transformedData = {
        outletRequests: data.outletRequests.map((request: any) => ({
          ...request,
          type: 'outlet',
          status: request.status || 'Pending'
        })),
        businessRequests: data.businessRequests.map((request: any) => ({
          ...request,
          type: 'business',
          status: 'Pending'
        }))
      };
      
      setRequests(transformedData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type: 'outlet' | 'business', id: number) => {
    try {
      const response = await fetch('/api/requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });

      if (!response.ok) throw new Error('Failed to approve request');

      toast({
        title: 'Success',
        description: 'Request approved successfully',
      });

      fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
    }
  };

  const handleViewDocument = async (type: 'outlet' | 'business', id: number) => {
    try {
      const response = await fetch(`/api/requests/${type}/${id}/document`);
      if (!response.ok) throw new Error('Failed to fetch document');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to view document',
        variant: 'destructive',
      });
    }
  };

  const totalRequests = requests.outletRequests.length + requests.businessRequests.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <StatCard
          title="Total Pending Registration Requests"
          value={totalRequests.toString()}
          icon={HelpCircle}
        />
        <Button className="bg-black text-white rounded-full">
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Tabs defaultValue="outlets">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="outlets">Outlet Requests</TabsTrigger>
              <TabsTrigger value="business">Business Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="outlets">
              <DataTable
                columns={outletColumns}
                data={requests.outletRequests}
                onRowClick={(row) => setSelectedRequest(row)}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="business">
              <DataTable
                columns={businessColumns}
                data={requests.businessRequests}
                onRowClick={(row) => setSelectedRequest(row)}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Request Details</h3>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedRequest.type === 'outlet' ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Outlet Name</p>
                      <p className="font-medium">{selectedRequest.Outlet_Name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Manager Name</p>
                      <p className="font-medium">{selectedRequest.Manager_Name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{selectedRequest.Contact_No || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedRequest.Email || 'N/A'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Business Name</p>
                      <p className="font-medium">{selectedRequest.Business_Name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Owner Name</p>
                      <p className="font-medium">{selectedRequest.Name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{selectedRequest.ContactNo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedRequest.Email || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>

              {(selectedRequest.has_certificate || selectedRequest.has_document) && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => handleViewDocument(
                    selectedRequest.type,
                    selectedRequest.type === 'outlet' ? selectedRequest.Manager_ID! : selectedRequest.ConsumerID!
                  )}
                >
                  View Document
                </Button>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(
                    selectedRequest.type,
                    selectedRequest.type === 'outlet' ? selectedRequest.Manager_ID! : selectedRequest.ConsumerID!
                  )}
                >
                  Approve Request
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
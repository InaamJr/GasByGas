'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Calendar, Store, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface OrderDetail {
  cylinder_type: string;
  weight_kg: number;
  quantity: number;
  detail_id: number;
  detail_status: string;
}

interface Delivery {
  id: number;
  order_id: number;
  outlet_name: string;
  district: string;
  manager_name: string;
  contact_no: string;
  admin_name: string;
  scheduled_date: string;
  delivery_date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  order_status: string;
  order_date: string;
  expected_delivery_date: string;
  order_details: OrderDetail[];
}

export default function ScheduledDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/deliveries');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch deliveries');
      }
      const data = await response.json();
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load deliveries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (delivery: Delivery, action: 'complete' | 'cancel') => {
    try {
      const body: any = {
        orderId: delivery.order_id,
        action
      };

      if (action === 'complete') {
        // Get all detail IDs from the delivery's order details
        body.detailIds = delivery.order_details.map(detail => detail.detail_id);
      }

      const response = await fetch('/api/deliveries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to update delivery status');
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: action === 'complete' ? 'Delivery marked as completed' : 'Delivery cancelled',
      });

      setSelectedDelivery(null);
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update delivery status',
        variant: 'destructive',
      });
    }
  };

  const filteredDeliveries = filterStatus === 'all'
    ? deliveries
    : deliveries.filter(delivery => delivery.status === filterStatus);

  const statusCounts = deliveries.reduce((acc, delivery) => {
    acc[delivery.status] = (acc[delivery.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scheduled Deliveries</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Deliveries</p>
            <p className="text-2xl font-bold">{deliveries.length}</p>
          </div>
          <ClipboardList className="w-8 h-8 text-gray-400" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Scheduled</p>
            <p className="text-2xl font-bold">{statusCounts.scheduled || 0}</p>
          </div>
          <Calendar className="w-8 h-8 text-gray-400" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold">{statusCounts.completed || 0}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-gray-400" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-[20px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Deliveries List</h3>
            <select
              className="px-4 py-2 border rounded-lg"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Deliveries</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading deliveries...</p>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No deliveries found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      <span className="font-medium">{delivery.outlet_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{delivery.district}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-4 w-4" />
                      <span>{delivery.contact_no}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      <span>Scheduled by: {delivery.admin_name}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Delivery Date: {new Date(delivery.delivery_date).toLocaleDateString()}
                  </div>
                  <Badge className={
                    delivery.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div>
          {selectedDelivery ? (
            <Card className="p-6 rounded-[20px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Delivery Details</h3>
                <Badge className={
                  selectedDelivery.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  selectedDelivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }>
                  {selectedDelivery.status.charAt(0).toUpperCase() + selectedDelivery.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Order Details</h3>
                  <div className="space-y-4">
                    {selectedDelivery.order_details.map((detail, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                        <div>
                          <p className="font-medium">{detail.cylinder_type} ({detail.weight_kg}kg)</p>
                          <p className="text-sm text-gray-500">Status: {detail.detail_status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{detail.quantity} units</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="font-medium">{selectedDelivery.manager_name}</p>
                    <p className="text-gray-600">{selectedDelivery.contact_no}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Delivery Information</h3>
                  <div className="bg-white p-4 rounded-lg shadow space-y-2">
                    <p><span className="font-medium">Scheduled by:</span> {selectedDelivery.admin_name}</p>
                    <p><span className="font-medium">Delivery Date:</span> {format(new Date(selectedDelivery.delivery_date), 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>

                {selectedDelivery.status === 'scheduled' && (
                  <div className="flex justify-end space-x-4 mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusUpdate(selectedDelivery, 'cancel')}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Cancel Delivery
                    </Button>
                    <Button 
                      onClick={() => handleStatusUpdate(selectedDelivery, 'complete')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 rounded-[20px] bg-gray-50">
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Select a delivery to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

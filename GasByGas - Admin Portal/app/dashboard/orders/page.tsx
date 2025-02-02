'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ClipboardList, Filter, Calendar as CalendarIcon, Store, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface OrderDetail {
  detail_id: number;
  cylinder_type: string;
  weight_kg: number;
  quantity: number;
  status: 'pending' | 'scheduled' | 'delivered' | 'cancelled';
}

interface Order {
  id: number;
  outlet_name: string;
  district: string;
  manager_name: string;
  contact_no: string;
  expected_delivery_date: string;
  order_date: string;
  order_details: OrderDetail[];
  status: 'pending' | 'scheduled' | 'delivered' | 'cancelled';
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDetails, setSelectedDetails] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (!session) {
      toast({
        title: 'Error',
        description: 'You must be logged in to view orders',
        variant: 'destructive',
      });
      return;
    }
    fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch orders');
      }
      const data = await response.json();
      console.log('Fetched orders:', data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleOrder = async () => {
    if (!selectedOrder || !selectedDate || selectedDetails.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select cylinders and a delivery date',
        variant: 'destructive',
      });
      return;
    }

    if (!session?.user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to schedule deliveries',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          detailIds: Array.from(selectedDetails),
          status: 'scheduled',
          scheduledBy: parseInt(session.user.id),
          deliveryDate: selectedDate.toISOString()
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule order');
      }

      toast({
        title: 'Success',
        description: 'Order scheduled successfully',
        duration: 3000,
      });

      setShowScheduler(false);
      setSelectedOrder(null);
      setSelectedDate(undefined);
      setSelectedDetails(new Set());
      fetchOrders();
    } catch (error) {
      console.error('Error scheduling order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule order',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (orderId: number, detailIds: number[], newStatus: string) => {
    if (!session?.user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update order status',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          detailIds,
          status: newStatus
        }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      toast({
        title: 'Success',
        description: `Selected items have been ${newStatus}`,
      });

      fetchOrders();
      setSelectedDetails(new Set());
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const statusCounts = orders.reduce((acc, order) => {
    if (order?.status) {
      acc[order.status] = (acc[order.status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={orders?.length || 0}
          icon={ClipboardList}
        />
        <StatCard
          title="Pending Orders"
          value={statusCounts?.pending || 0}
          icon={Filter}
        />
        <StatCard
          title="Scheduled Orders"
          value={statusCounts?.scheduled || 0}
          icon={CalendarIcon}
        />
        <StatCard
          title="Delivered Orders"
          value={statusCounts?.delivered || 0}
          icon={ClipboardList}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-[20px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Orders List</h3>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border rounded-lg"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Outlet</th>
                    <th className="text-left p-4">Order Details</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Expected Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{order.outlet_name}</div>
                          <div className="text-sm text-gray-500">{order.district}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-[300px] whitespace-normal">
                          {order.order_details && order.order_details.length > 0 ? (
                            order.order_details.map((detail, index) => (
                              <div key={index} className="text-sm">
                                {detail.cylinder_type} ({detail.quantity} units)
                                {index < order.order_details.length - 1 ? ', ' : ''}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500">No details available</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {order.expected_delivery_date ? 
                            new Date(order.expected_delivery_date).toLocaleDateString() :
                            'Not scheduled'
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {selectedOrder ? (
            <Card className="p-6 rounded-[20px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Order Details</h3>
                <Badge className={
                  selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedOrder.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Store className="w-5 h-5 mt-1" />
                  <div>
                    <h4 className="font-medium">Outlet Information</h4>
                    <p className="text-lg">{selectedOrder.outlet_name}</p>
                    <p className="text-gray-500">{selectedOrder.district}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <ClipboardList className="w-5 h-5 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium">Order Details</h4>
                    <div className="space-y-2 mt-2">
                      {selectedOrder.order_details && selectedOrder.order_details.length > 0 ? (
                        selectedOrder.order_details.map((detail, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedDetails.has(detail.detail_id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedDetails);
                                  if (e.target.checked) {
                                    newSelected.add(detail.detail_id);
                                  } else {
                                    newSelected.delete(detail.detail_id);
                                  }
                                  setSelectedDetails(newSelected);
                                }}
                                className="w-4 h-4 rounded border-gray-300"
                                disabled={detail.status === 'delivered' || detail.status === 'cancelled'}
                              />
                              <div>
                                <span className="font-medium">{detail.cylinder_type}</span>
                                <span className="text-sm text-gray-500 ml-2">({detail.weight_kg}kg)</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={
                                detail.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                detail.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                detail.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                              </Badge>
                              <span className="font-medium">{detail.quantity} units</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 bg-gray-50 rounded">
                          <p className="text-gray-500">No order details available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 mt-1" />
                  <div>
                    <h4 className="font-medium">Contact Information</h4>
                    <p className="text-lg">{selectedOrder.manager_name}</p>
                    <p className="text-gray-500">{selectedOrder.contact_no}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CalendarIcon className="w-5 h-5 mt-1" />
                  <div>
                    <h4 className="font-medium">Delivery Date</h4>
                    <p className="text-lg">
                      {selectedOrder.expected_delivery_date ? 
                        new Date(selectedOrder.expected_delivery_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not scheduled yet'
                      }
                    </p>
                  </div>
                </div>

                {!showScheduler && (
                  <div className="flex gap-4 pt-4">
                    {selectedDetails.size > 0 && (
                      <>
                        {selectedOrder.order_details.some(d => d.status === 'pending' && selectedDetails.has(d.detail_id)) && (
                          <>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleStatusChange(selectedOrder.id, Array.from(selectedDetails), 'cancelled')}
                            >
                              Cancel Selected
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={() => setShowScheduler(true)}
                            >
                              Schedule Selected
                            </Button>
                          </>
                        )}
                        {selectedOrder.order_details.some(d => d.status === 'scheduled' && selectedDetails.has(d.detail_id)) && (
                          <Button
                            className="flex-1"
                            onClick={() => handleStatusChange(selectedOrder.id, Array.from(selectedDetails), 'delivered')}
                          >
                            Mark Selected as Delivered
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 rounded-[20px] bg-gray-50">
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Select an order to view details</p>
              </div>
            </Card>
          )}

          {showScheduler && selectedOrder && (
            <Card className="p-6 rounded-[20px]">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Schedule Delivery</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowScheduler(false);
                      setSelectedDate(undefined);
                    }}
                  >
                    Back to Details
                  </Button>
                </div>

                <div className="text-center">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700">Order #{selectedOrder.id}</h4>
                    <p className="text-sm text-gray-500 mt-1">{selectedOrder.outlet_name}</p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border mx-auto"
                    disabled={(date) => date < new Date()}
                  />
                  {selectedDate && (
                    <p className="text-sm text-gray-600 mt-2">
                      Delivery scheduled for {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedDate || selectedDetails.size === 0}
                  onClick={handleScheduleOrder}
                >
                  Confirm Schedule
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
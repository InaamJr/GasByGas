"use client";

import { useEffect, useState } from "react";

const OrderDetails = ({ outletId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(""); // For sorting/filtering

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/manager/fetch-orders", {
        method: "GET",
        headers: { "outlet-id": outletId },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else {
        console.error("Failed to fetch orders:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (outletId) {
      fetchOrders();
    }
  }, [outletId]);

  if (loading) {
    return <p>Loading order details...</p>;
  }

  if (orders.length === 0) {
    return <p>No orders found.</p>;
  }

  // Helper function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Extract only the date part
  };

  // Filter and sort orders based on the selected status
  const filteredOrders = orders.filter((order) =>
    selectedStatus
      ? order.status.toLowerCase().trim() === selectedStatus.toLowerCase().trim()
      : true
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Order Details</h2>
        <div className="text-gray-600 px-8">
          <label htmlFor="statusFilter" className="mr-2">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            className="border rounded-lg px-3 py-1"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">Order ID</th>
            <th className="border-b p-2 text-left">Order Date</th>
            <th className="border-b p-2 text-left">Expected Delivery Date</th>
            <th className="border-b p-2 text-left">Scheduled Delivery Date</th>
            <th className="border-b p-2 text-left">Status</th>
            <th className="border-b p-2 text-left">Cylinders</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, index) => (
            <tr key={`${order.order_id}-${index}`}>
              <td className="border-b p-2">{order.order_id}</td>
              <td className="border-b p-2">{formatDate(order.order_date)}</td>
              <td className="border-b p-2">{formatDate(order.expected_delivery_date)}</td>
              <td className="border-b p-2">
                {order.scheduled_delivery_date
                  ? formatDate(order.scheduled_delivery_date)
                  : "N/A"}
              </td>
              <td className="border-b p-2 capitalize">{order.status}</td>
              <td className="border-b p-2">
                {order.cylinder_name} ({order.quantity})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetails;

"use client";

import { useState, useEffect } from "react";

const AddOrderModal = ({ showModal, onClose, onSubmit, cylinders }) => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");

  const handleAddCylinder = () => {
    setOrderDetails([...orderDetails, { cylinder_type_id: "", quantity: "" }]);
  };

  const handleRemoveCylinder = (index) => {
    const updatedDetails = [...orderDetails];
    updatedDetails.splice(index, 1);
    setOrderDetails(updatedDetails);
  };

  const handleChange = (index, field, value) => {
    const updatedDetails = [...orderDetails];
    updatedDetails[index][field] = value;
    setOrderDetails(updatedDetails);
  };

  const handleSubmit = () => {
    if (!expectedDeliveryDate) {
      alert("Expected delivery date is required.");
      return;
    }
    if (orderDetails.length === 0) {
      alert("Please add at least one cylinder.");
      return;
    }
    for (const detail of orderDetails) {
      if (!detail.cylinder_type_id || !detail.quantity || detail.quantity <= 0) {
        alert("Please ensure all cylinder details are valid (type and positive quantity).");
        return;
      }
    }
    onSubmit({ orderDetails, expectedDeliveryDate });

    // Clear the form state after submission
    setOrderDetails([]);
    setExpectedDeliveryDate("");
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/2 shadow-transparent shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add New Order</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Expected Delivery Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded-lg cursor-pointer"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
          />
        </div>
        <h3 className="text-lg font-semibold mb-2">Order Details</h3>
        {orderDetails.map((detail, index) => (
          <div key={index} className="flex items-center space-x-4 mb-4">
            <select
              className="w-1/2 p-2 border rounded-lg"
              value={detail.cylinder_type_id}
              onChange={(e) =>
                handleChange(index, "cylinder_type_id", e.target.value)
              }
            >
              <option value="">Select Cylinder Type</option>
              {cylinders.map((cylinder) => (
                <option key={cylinder.type_id} value={cylinder.type_id}>
                  {cylinder.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="w-1/4 p-2 border rounded-lg"
              placeholder="Quantity"
              value={detail.quantity}
              onChange={(e) => handleChange(index, "quantity", e.target.value)}
            />
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-lg"
              onClick={() => handleRemoveCylinder(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4"
          onClick={handleAddCylinder}
        >
          Add Cylinder
        </button>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-orange-500 text-white py-2 px-4 rounded-lg"
            onClick={handleSubmit}
          >
            Submit Order
          </button>

          <button
            className="bg-gray-500 text-white py-2 px-4 rounded-lg ml-4"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrderModal;

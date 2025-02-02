"use client";

import React from "react";

const EditProfileModal = ({
  showModal,
  managerDetails,
  updatedDetails,
  setUpdatedDetails,
  onClose,
  onUpdate,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-1/2">
        <h2 className="text-xl font-bold mb-4 text-center">Edit Profile</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700">
              Manager ID:{" "}
              <span className="text-red-500 font-semibold text-lg px-4">
                {managerDetails.manager_id || ""}
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">
              Registration ID:{" "}
              <span className="font-medium px-4 text-gray-500">
                {managerDetails.outlet_registration_id || ""}
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">
              Outlet Name:{" "}
              <span className="font-medium px-4 text-gray-500">
                {managerDetails.outlet_name || ""}
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Outlet Address</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              value={updatedDetails.outlet_address || ""}
              onChange={(e) =>
                setUpdatedDetails({
                  ...updatedDetails,
                  outlet_address: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Manager Name</label>
            <input
              type="text"
              className="w-full border rounded-lg p-2"
              value={updatedDetails.manager_name || ""}
              onChange={(e) =>
                setUpdatedDetails({
                  ...updatedDetails,
                  manager_name: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg p-2"
              value={updatedDetails.email || ""}
              onChange={(e) =>
                setUpdatedDetails({ ...updatedDetails, email: e.target.value })
              }
            />
          </div>
          <div className="mb-4 flex gap-4">
            <div className="w-1/2">
              <label className="block text-gray-700">Contact No</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={updatedDetails.contact_no || ""}
                onChange={(e) =>
                  setUpdatedDetails({
                    ...updatedDetails,
                    contact_no: e.target.value,
                  })
                }
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700">NIC</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={updatedDetails.nic || ""}
                onChange={(e) =>
                  setUpdatedDetails({
                    ...updatedDetails,
                    nic: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-orange-500 text-white py-2 px-4 rounded-lg"
              onClick={onUpdate}
            >
              Update
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white py-2 px-4 rounded-lg ml-4"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;

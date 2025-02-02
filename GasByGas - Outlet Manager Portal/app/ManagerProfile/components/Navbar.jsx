"use client";

import React, { useState } from "react";
import NotificationCenter from "./NotificationCenter";

const Navbar = ({ onEditProfileClick, managerId }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="flex justify-between items-center mb-6 relative">
      <div className="relative w-96">
        <input
          type="text"
          placeholder="Search"
          className="w-full py-2 px-4 rounded-full bg-white opacity-70 shadow-md text-gray-600 focus:outline-none"
        />
        <img
          src="/search.png"
          alt="Search"
          className="absolute top-1/2 right-3 transform -translate-y-1/2 w-5 h-5 text-gray-500"
        />
      </div>

      <div className="flex items-center space-x-6">
        <img
          src="/notification.png"
          alt="Notifications"
          className="w-7 h-7 cursor-pointer"
          onClick={toggleNotifications}
        />
        <button onClick={onEditProfileClick}>
          <img
            src="/user.png"
            alt="User Icon"
            className="w-9 h-9 rounded-full cursor-pointer"
          />
        </button>

        {showNotifications && (
          <div className="absolute top-12 right-0 w-3/6 bg-white shadow-lg rounded-lg border border-gray-200 z-50 p-4">
            <NotificationCenter
              managerId={managerId}
              onClose={() => setShowNotifications(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

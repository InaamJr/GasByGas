"use client";

import React from "react";

const Sidebar = ({ managerName, onLogout, onAddOrderClick, onOrderDetailsClick, onViewStockClick, setActiveSection }) => {
  return (
    <div className="bg-transparent-100 py-3 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="flex mb-0">
        <img
          src="/Gas by Gas - Icon.png"
          alt="Logo"
          className="w-24 h-24 ml-0"
        />
      </div>

      {/* Menu Items */}
      <div className="space-y-4 px-6">
        <h1 className="text-xl font-bold text-gray-700 mb-11">
          Welcome, {managerName}
        </h1>

        <h2 className="text-sm font-bold text-gray-500 mb-4">General</h2>

        <div
          className="flex items-center space-x-4 cursor-pointer hover:bg-gray-200 p-1 ml-3 rounded-lg"
          onClick={onAddOrderClick} 
        >
          <img src="/Add Order.png" alt="Add Order" className="w-6 h-6" />
          <span className="text-gray-800">Add Order</span>
        </div>

        <div
          className="flex items-center space-x-4 cursor-pointer hover:bg-gray-200 p-1 ml-3 rounded-lg"
          onClick={() => setActiveSection("requests")} 
        >
          <img src="/gas-cylinder.png" alt="Add Order" className="w-6 h-6" />
          <span className="text-gray-800">Requests</span>
        </div>

        <div className="flex items-center space-x-4 cursor-pointer hover:bg-gray-200 p-1 ml-3 rounded-lg"
        onClick={() => setActiveSection("viewTokens")}
        >
          <img src="/tokens.png" alt="View Tokens" className="w-6 h-6"/>
          <span className="text-gray-800">Tokens</span>
        </div>

        <div
          className="flex items-center space-x-4 cursor-pointer hover:bg-gray-200 p-1 ml-3 rounded-lg"
          onClick={onOrderDetailsClick} 
        >
          <img src="/OrderDetails.png" alt="Order Details" className="w-6 h-6" />
          <span className="text-gray-800">Order Details</span>
        </div>

        <div
          className="flex items-center space-x-4 cursor-pointer hover:bg-gray-200 p-1 ml-3 rounded-lg"
          onClick={onViewStockClick}
        >
          <img src="/Stock.png" alt="View Stock" className="w-6 h-6" />
          <span className="text-gray-800">View Stock</span>
        </div>

      </div>

      {/* Logout */}
      <div className="mt-auto p-6">
        <div
          className="flex items-center justify-center space-x-4 cursor-pointer hover:bg-orange-500 p-3 rounded-lg bg-orange-400 text-white"
          onClick={onLogout}
        >
          <img src="/Logout2.png" alt="Logout" className="w-6 h-6" />
          <span>Logout</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-400 text-sm mt-1">
        © 2025 Gas By Gas
      </div>
    </div>
  );
};

export default Sidebar;

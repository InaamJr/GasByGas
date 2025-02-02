"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const Login = ({ formData, handleChange, resetForm }) => {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Email || !formData.Password) {
      alert("Please fill in all fields.");
      resetForm(); // Clear the fields
      return;
    }
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: formData.Email,
          Password: formData.Password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        resetForm(); // Clear the fields
        router.push("/ManagerProfile");
      } else {
        alert(data.error);
        resetForm(); // Clear the fields
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to login. Please try again.");
      resetForm(); // Clear the fields
    }
  };

  return (
    <>
      <input
        type="email"
        name="Email"
        placeholder="Enter Outlet Email"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        value={formData.Email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="Password"
        placeholder="Enter Password"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        value={formData.Password}
        onChange={handleChange}
      />
      <div className="flex justify-center">
        <button
          type="submit"
          className="w-1/2 py-3 bg-orange-500 rounded-lg text-white font-semibold"
          onClick={handleSubmit}
        >
          Get Started
        </button>
      </div>
    </>
  );
};

export default Login;

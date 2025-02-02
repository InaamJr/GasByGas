"use client";

import { useState, useRef } from "react";
import Login from "./components/Login";
import RequestRegistration from "./components/RequestRegistration";

const Main = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    Outlet_RegistrationID: "",
    Outlet_Name: "",
    Outlet_Address: "",
    Outlet_Certificate: null,
    Manager_Name: "",
    NIC: "",
    Email: "",
    Contact_No: "",
    Password: "",
  });

  // Reference for file input to manually clear it
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const resetForm = () => {
    setFormData({
      Outlet_RegistrationID: "",
      Outlet_Name: "",
      Outlet_Address: "",
      Outlet_Certificate: null,
      Manager_Name: "",
      NIC: "",
      Email: "",
      Contact_No: "",
      Password: "",
    });

    // Reset the file input field manually
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-row items-center justify-between min-h-screen px-10 bg-black">
      <div className="flex flex-col items-center md:items-start">
        <img
          src="/backgroundIMG.jpg"
          alt="Background"
          className="absolute inset-0 w-2/4 h-full object-cover z-0 opacity-50 rounded-lg px-px"
        />
        <div className="relative z-10 flex flex-col items-center md:items-start ml-60 mt-96">
          <img
            src="/gas-burner.png"
            alt="Gas Burner"
            className="w-30 md:w-60 rounded-lg shadow-md"
          />
          <p className="text-gray-400 mt-1 text-sm ml-12">Made Convenient</p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between min-h-screen px-10">
        <div className="w-full max-w-md p-8 bg-transparent rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-white">
            Outlet Manager {isLogin ? "Login" : "Request Register"}
          </h1>

          <div className="flex justify-center items-center mt-6">
            <div className="flex rounded-lg bg-gray-600 px-1 py-1 shadow-md">
              <button
                className={`py-2 px-8 text-sm font-semibold transition-all duration-300 ${
                  isLogin ? "bg-white text-black rounded-lg shadow-md" : "text-white bg-transparent"
                }`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`py-2 px-8 text-sm font-semibold transition-all duration-300 ${
                  !isLogin ? "bg-white text-black rounded-lg shadow-md" : "text-white bg-transparent"
                }`}
                onClick={() => setIsLogin(false)}
              >
                Request Register
              </button>
            </div>
          </div>

          <form className="mt-6 space-y-5">
            {isLogin ? (
              <Login formData={formData} handleChange={handleChange} resetForm={resetForm} />
            ) : (
              <RequestRegistration
                formData={formData}
                handleChange={handleChange}
                resetForm={resetForm}
                fileInputRef={fileInputRef} // Pass the file input reference
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Main;

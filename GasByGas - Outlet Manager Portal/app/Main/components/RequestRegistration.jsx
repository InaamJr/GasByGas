"use client";

import { useRouter } from "next/navigation";

const RequestRegistration = ({ formData, handleChange, resetForm, fileInputRef }) => {
  const router = useRouter();

  const validateForm = () => {
    const {
      Outlet_RegistrationID,
      Outlet_Name,
      Outlet_Address,
      Outlet_Certificate,
      Manager_Name,
      NIC,
      Email,
      Contact_No,
      Password,
    } = formData;

    if (
      !Outlet_RegistrationID.trim() ||
      !Outlet_Name.trim() ||
      !Outlet_Address.trim() ||
      !Outlet_Certificate ||
      !Manager_Name.trim() ||
      !NIC.trim() ||
      !Email.trim() ||
      !Contact_No.trim() ||
      !Password.trim()
    ) {
      alert("All fields are required. Please fill in every field.");
      return false;
    }

    // Additional validation
    if (!/^[0-9]+$/.test(Contact_No)) {
      alert("Contact number should contain only digits.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(Email)) {
      alert("Please provide a valid email address.");
      return false;
    }

    if (NIC.length < 10) {
      alert("NIC must be at least 10 characters.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch("/api/manager/request_registration", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert("Registration Request Sent successfully!");
        resetForm();
        router.push("/Main");
      } else {
        const errorData = await response.json();
        alert(`Failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error:", error.message);
      alert("Failed to submit registration request");
    }
  };

  return (
    <>
      <input
        type="text"
        name="Outlet_RegistrationID"
        placeholder="Outlet Registration ID"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        onChange={handleChange}
        value={formData.Outlet_RegistrationID || ""}
      />
      <input
        type="text"
        name="Outlet_Name"
        placeholder="Outlet Name"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        onChange={handleChange}
        value={formData.Outlet_Name || ""}
      />
      <input
        type="text"
        name="Outlet_Address"
        placeholder="Outlet Address"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        onChange={handleChange}
        value={formData.Outlet_Address || ""}
      />
      <input
        type="file"
        name="Outlet_Certificate"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        onChange={handleChange}
        ref={fileInputRef}
      />
      <input
        type="text"
        name="Manager_Name"
        placeholder="Manager Name"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        onChange={handleChange}
        value={formData.Manager_Name || ""}
      />
      <input
        type="text"
        name="NIC"
        placeholder="NIC"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        onChange={handleChange}
        value={formData.NIC || ""}
      />
      <input
        type="email"
        name="Email"
        placeholder="Email"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        onChange={handleChange}
        value={formData.Email || ""}
      />
      <input
        type="text"
        name="Contact_No"
        placeholder="Contact Number"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        onChange={handleChange}
        value={formData.Contact_No || ""}
      />
      <input
        type="password"
        name="Password"
        placeholder="Password"
        className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white"
        onChange={handleChange}
        value={formData.Password || ""}
      />
      <div className="flex justify-center">
        <button
          type="submit"
          className="w-1/2 py-3 bg-orange-500 rounded-lg text-white font-semibold"
          onClick={handleSubmit}
        >
          Request
        </button>
      </div>
    </>
  );
};

export default RequestRegistration;

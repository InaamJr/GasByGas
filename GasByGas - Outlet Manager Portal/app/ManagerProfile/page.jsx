"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import EditProfileModal from "./components/EditProfileModal";
import AddOrderModal from "./components/AddOrderModal";
import OrderDetails from "./components/OrderDetail";
import ViewStock from "./components/ViewStock";
import ViewGasRequests from "./components/ViewGasRequests";
import ViewTokens from "./components/ViewTokens";

const ManagerProfile = () => {
  const [managerName, setManagerName] = useState("");
  const [managerDetails, setManagerDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState({});
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [cylinders, setCylinders] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        alert("Logged out successfully.");
        router.push("/Main");
      } else {
        alert("Failed to log out.");
      }
    } catch (error) {
      console.error("Logout Error:", error);
      alert("An error occurred during logout.");
    }
  };

  const fetchManagerDetails = async () => {
    try {
      const response = await fetch("/api/manager/manager-details", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.manager.manager_id) {
          throw new Error("Manager ID is missing. Please contact support.");
        }

        setManagerDetails(data.manager);
        setUpdatedDetails(data.manager);

      // Trigger notification generation for the current outlet
      await fetch("/api/manager/generate-notifications", {
        method: "GET",
        headers: { "manager-id": data.manager.manager_id },
      });
      // Trigger notification generation for the current outlet
      await fetch("/api/test-delivery-notification", {
        method: "GET",
        headers: { "manager-id": data.manager.manager_id },
      });
      } else {
        alert("Failed to Fetch Manager Details.");
      }
    } catch (error) {
      console.error("Error fetching manager details:", error);
      alert("An error occurred while fetching manager details.");
    }
  };  

  const handleAddOrder = async (orderData) => {
    if (!managerDetails.outlet_id) {
      alert("Outlet ID is missing. Please contact support.");
      return;
    }

    try {
      const response = await fetch("/api/manager/add-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderData,
          outlet_id: managerDetails.outlet_id,
        }),
      });

      if (response.ok) {
        alert("Order added successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to add order: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error adding order:", error);
      alert("An error occurred while adding the order.");
    }
  };

  const fetchCylinders = async () => {
    try {
      const response = await fetch("/api/cylinders", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCylinders(data.cylinders);
      } else {
        console.error("Failed to fetch cylinder types:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching cylinder types:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-auth", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setManagerName(data.user.name);
        } else {
          const data = await response.json();
          alert(data.error);
          router.push("/Main");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        alert("An error occurred. Please try logging in again.");
        router.push("/Main");
      }
    };

    checkAuth();
    fetchManagerDetails();
    fetchCylinders();
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-300">
      <Sidebar
        managerName={managerName}
        onLogout={handleLogout}
        onAddOrderClick={() => setActiveSection("addOrder")}
        onOrderDetailsClick={() => setActiveSection("orderDetails")}
        onViewStockClick={() => setActiveSection("viewStock")}
        setActiveSection={setActiveSection}
        onViewRequestsClick={() => setActiveSection("requests")} 
        onViewTokensClick={() => setActiveSection("viewTokens")} 
      />

      <div className="flex-1 p-8">
        <Navbar 
        onEditProfileClick={() => setShowModal(true)} 
        managerId={managerDetails.manager_id}
        />
        <EditProfileModal
          showModal={showModal}
          managerDetails={managerDetails}
          updatedDetails={updatedDetails}
          setUpdatedDetails={setUpdatedDetails}
          onClose={() => setShowModal(false)}
          onUpdate={fetchManagerDetails}
        />

        {activeSection === "dashboard" && (
          <div className="bg-white shadow-lg rounded-xl p-8 mt-6 ml-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          </div>
        )}

        {activeSection === "addOrder" && (
          <AddOrderModal
            showModal={true}
            onClose={() => setActiveSection("dashboard")}
            onSubmit={handleAddOrder}
            cylinders={cylinders}
          />
        )}

        {activeSection === "orderDetails" && (
          <div className="bg-white shadow-lg rounded-xl p-8 mt-6 ml-6">
            <OrderDetails outletId={managerDetails.outlet_id} />
          </div>
        )}

        {activeSection === "viewStock" && (
          <div className="bg-white shadow-lg rounded-xl p-8 mt-6 ml-6">
            <ViewStock outletId={managerDetails.outlet_id} />
          </div>
        )}

        {activeSection === 'requests' && (
          <ViewGasRequests outletId={managerDetails.outlet_id} />
        )}

        {activeSection === "viewTokens" && (
          <div className="bg-white shadow-lg rounded-xl p-8 mt-6 ml-6">
            <ViewTokens outletId={managerDetails.outlet_id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerProfile;

import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const ViewGasRequests = ({ outletId }) => {
  const [requests, setRequests] = useState([]);
  const [activeType, setActiveType] = useState("general");
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loggedInManagerId, setLoggedInManagerId] = useState(null);

  // Fetch manager details to get the logged-in outlet ID
  useEffect(() => {
    const fetchManagerDetails = async () => {
      try {
        const response = await fetch("/api/manager/manager-details");
        if (response.ok) {
          const data = await response.json();
          setLoggedInManagerId(data.manager.outlet_id);
        } else {
          alert("Failed to fetch manager details");
        }
      } catch (error) {
        console.error("Error fetching manager details:", error);
      }
    };

    fetchManagerDetails();
  }, []);

  const fetchRequests = async () => {
    if (!loggedInManagerId) return;

    setLoading(true);
    try {
      const endpoint =
        activeType === "general"
          ? `/api/manager/general-requests?outlet_id=${loggedInManagerId}`
          : `/api/manager/business-requests?outlet_id=${loggedInManagerId}`;

      const response = await fetch(endpoint);

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      } else {
        const errorMessage = await response.json();
        alert(`Failed to fetch requests: ${errorMessage.error}`);
        setRequests([]);
      }
    } catch (error) {
      alert("An error occurred while fetching requests. Please try again.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!selectedRequest || !loggedInManagerId) {
      alert("No request selected or manager not authenticated.");
      return;
    }
  
    try {
      if (action === "accepted") {
        const tokenResponse = await fetch("/api/manager/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: selectedRequest.request_id,
            managerId: loggedInManagerId,
          }),
        });
  
        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          alert(`Failed to generate token: ${errorData.error}`);
          return;
        }
  
        const tokenData = await tokenResponse.json();
        alert(`Token generated successfully:
          Token: ${tokenData.token.tokenNo}
          Expiry Date: ${new Date(tokenData.token.expiryDate).toLocaleDateString()}`);
      } else {
        const statusResponse = await fetch("/api/manager/update-request-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: selectedRequest.request_id,
            status: action,
          }),
        });
  
        if (statusResponse.ok) {
          alert(`Request successfully ${action}`);
        } else {
          const errorData = await statusResponse.json();
          alert(`Failed to ${action} request: ${errorData.error}`);
        }
      }
  
      fetchRequests(); // Refresh the requests list
      setSelectedRequest(null); // Close the modal
    } catch (error) {
      console.error(`Error performing ${action} action:`, error.message);
      alert(`An error occurred while trying to ${action} the request.`);
    }
  };
  

  useEffect(() => {
    if (loggedInManagerId) fetchRequests();
  }, [activeType, loggedInManagerId]);

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const filteredRequests = requests.filter((request) =>
    filterStatus === "all" ? true : request.status === filterStatus
  );

  const sortedRequests = filteredRequests.sort((a, b) => {
    if (sortOrder === "asc") {
      return a.status.localeCompare(b.status);
    } else {
      return b.status.localeCompare(a.status);
    }
  });

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 mt-6 ml-6">
      <h2 className="text-2xl font-bold mb-4">Gas Requests</h2>

      <div className="flex justify-between items-center mt-4 mb-6">
        {/* Consumer Type Toggle */}
        <div className="flex rounded-lg bg-gray-600 p-1 shadow-md">
          <button
            className={`py-2 px-5 text-sm font-semibold transition-all duration-300 ${
              activeType === "general"
                ? "bg-white text-black rounded-lg shadow-md"
                : "text-white bg-transparent"
            }`}
            onClick={() => setActiveType("general")}
          >
            General Consumers
          </button>
          <button
            className={`py-2 px-5 text-sm font-semibold transition-all duration-300 ${
              activeType === "business"
                ? "bg-white text-black rounded-lg shadow-md"
                : "text-white bg-transparent"
            }`}
            onClick={() => setActiveType("business")}
          >
            Business/Industrial Consumers
          </button>
        </div>

        {/* Filter and Sort Options */}
        <div className="text-gray-600 px-8">
          <label htmlFor="statusFilter" className="mr-2">
            Filter by Status:
          </label>
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="border rounded-md p-2"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : sortedRequests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">Name</th>
              <th className="border-b p-2 text-left">Request Date</th>
              <th className="border-b p-2 text-left">Pickup Date</th>
              <th className="border-b p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((request) => (
              <tr
                key={request.request_id}
                onClick={() => setSelectedRequest(request)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <td className="border-b p-2">{request.name}</td>
                <td className="border-b p-2">
                  {new Date(request.request_date).toLocaleString()}
                </td>
                <td className="border-b p-2">
                  {new Date(request.expected_pickup_date).toLocaleDateString()}
                </td>
                <td className="border-b p-2 capitalize">{request.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedRequest && (
        <>
          {console.log("Selected Request:", selectedRequest)}
          {console.log("Manager ID:", loggedInManagerId)}
          {console.log("Outlet ID:", loggedInManagerId)}
          <Modal
            selectedRequest={selectedRequest}
            managerId={loggedInManagerId}
            outletId={loggedInManagerId}
            onClose={() => {
              setSelectedRequest(null);
              fetchRequests();
            }}
            handleAction={handleAction}
            title="Request Details"
          >
            {{
              consumerData: (
                <>
                  <p>
                    <strong>Name:</strong> {selectedRequest.name}
                  </p>
                  {activeType === "business" && (
                    <>
                      <p>
                        <strong>Business Registration No:</strong>{" "}
                        {selectedRequest.business_reg_no}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedRequest.email}
                      </p>
                      <p>
                        <strong>Contact No:</strong> {selectedRequest.contact_no}
                      </p>
                    </>
                  )}
                  {activeType === "general" && (
                    <>
                      <p>
                        <strong>Email:</strong> {selectedRequest.email}
                      </p>
                      <p>
                        <strong>NIC:</strong> {selectedRequest.nic}
                      </p>
                      <p>
                        <strong>Contact No:</strong> {selectedRequest.contact_no}
                      </p>
                    </>
                  )}
                </>
              ),
              requestDetails: (
                <>
                  <p>
                    <strong>Request Date:</strong>{" "}
                    {new Date(selectedRequest.request_date).toLocaleString()}
                  </p>
                  <p>
                    <strong>Pickup Date:</strong>{" "}
                    {new Date(selectedRequest.expected_pickup_date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Gas Request Details:</strong>
                  </p>
                  <ul className="list-disc pl-5">
                    {selectedRequest.cylinder_details
                      ? selectedRequest.cylinder_details
                          .split(", ")
                          .map((detail, index) => <li key={index}>{detail}</li>)
                      : "No details available"}
                  </ul>
                </>
              ),
            }}
          </Modal>
        </>
      )}
    </div>
  );
};

export default ViewGasRequests;

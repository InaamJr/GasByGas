import React, { useState, useEffect } from "react";

const ViewTokens = ({ outletId }) => {
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);
  const [gasRequestDetails, setGasRequestDetails] = useState(null);
  const [showReallocationModal, setShowReallocationModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [filterStatus, setFilterStatus] = useState("all");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");   

  // Fetch all tokens
  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/manager/view-tokens?outlet_id=${outletId}`);
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch tokens");
        return;
      }
      const data = await response.json();

      // Handle tokens with "reallocated" status
      const updatedTokens = await Promise.all(
        data.tokens.map(async (token) => {
          if (token.status === "reallocated" && token.reallocated_to) {
            const reallocatedResponse = await fetch(
              `/api/manager/gas-request-details?request_id=${token.reallocated_to}`
            );
            if (reallocatedResponse.ok) {
              const reallocatedDetails = await reallocatedResponse.json();
              return { ...token, gasRequestDetails: reallocatedDetails };
            }
          }
          return token;
        })
      );

      setTokens(updatedTokens);
      setFilteredTokens(updatedTokens);
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError("An error occurred while fetching tokens");
    } finally {
      setLoading(false);
    }
  };    

    useEffect(() => {
    if (outletId) fetchTokens();
  }, [outletId]);

  const handleTokenClick = async (token) => {
    try {
      setSelectedToken(token);
      const requestId = token.status === "reallocated" ? token.reallocated_to : token.request_id;

      const response = await fetch(`/api/manager/gas-request-details?request_id=${requestId}`);
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to fetch gas request details: ${errorData.error}`);
        return;
      }
      const updatedDetails = await response.json();
      setGasRequestDetails(updatedDetails);
    } catch (error) {
      console.error("Error fetching gas request details:", error.message);
      alert("An error occurred while fetching gas request details.");
    }
  };

  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true); // Open the confirm modal
  };
  
  const handleConfirmUseToken = async () => {
    try {
      const requestId = selectedToken.status === "reallocated" ? selectedToken.reallocated_to : selectedToken.request_id;
      const response = await fetch("/api/manager/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_id: selectedToken.token_id }),
      });
  
      if (response.ok) {
        setShowConfirmModal(false); // Close the confirm modal
        setShowOtpModal(true); // Show OTP modal
        alert("OTP sent to consumer's email.");
      } else {
        const errorData = await response.json();
        alert(`Failed to send OTP: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error generating OTP:", error.message);
      alert("An error occurred while generating OTP.");
    }
  };  

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch("/api/manager/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_id: selectedToken.token_id, otp }),
      });

      if (response.ok) {
        setShowOtpModal(false);
        alert("Token marked as used successfully!");
        
        // Fetch the updated list of tokens
        await fetchTokens();

        // Clear the selected token and gas request details
        setSelectedToken(null);
        setGasRequestDetails(null);

      } else {
        const errorData = await response.json();
        alert(`OTP verification failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error.message);
      alert("An error occurred while verifying OTP.");
    }
  };  

  // Fetch pending gas requests for reallocation
  const fetchPendingRequests = async () => {
    try {
      console.log("Fetching pending requests for outlet:", outletId); // Debugging log
      const response = await fetch(`/api/manager/fetch-pending-requests?outlet_id=${outletId}`);
      const contentType = response.headers.get("content-type");
  
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Unexpected response type:", contentType);
        throw new Error("Unexpected response type: " + contentType);
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error(errorData.error || "Failed to fetch pending requests");
      }
  
      const data = await response.json();
      console.log("Fetched pending requests:", data); // Debugging log
      setPendingRequests(data.requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error.message);
      alert("An error occurred while fetching pending requests.");
    }
  };  

  // Handle reallocation logic
  const handleReallocate = async (newRequestId) => {
    if (!selectedToken) return;
  
    try {
      const response = await fetch(`/api/manager/reallocate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: selectedToken.token_id,
          originalRequestId: selectedToken.request_id,
          newRequestId,
          reallocatedBy: outletId,
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
  
        // Update token and fetch new details
        const updatedToken = { ...selectedToken, request_id: newRequestId, status: "reallocated" };
        setSelectedToken(updatedToken);
  
        // Fetch the latest request details
        const updatedDetailsResponse = await fetch(
          `/api/manager/gas-request-details?request_id=${newRequestId}`
        );
        if (!updatedDetailsResponse.ok) {
          throw new Error("Failed to fetch updated request details");
        }
        const updatedDetails = await updatedDetailsResponse.json();
  
        setGasRequestDetails(updatedDetails);
  
        // Update the token list
        setTokens((prevTokens) =>
          prevTokens.map((token) =>
            token.token_id === updatedToken.token_id ? updatedToken : token
          )
        );
  
        setShowReallocationModal(false);
        alert("Token reallocated and details updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to reallocate token: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error reallocating token:", error.message);
      alert("An error occurred while reallocating the token.");
    }
  };  

  // Handle filter changes
  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    applyFilterAndSort(status, tokens);
  };

  // Apply filter and sort tokens
  const applyFilterAndSort = (status, tokensToFilter) => {
    let filtered = tokensToFilter;
    if (status !== "all") {
      filtered = filtered.filter((token) => token.status === status);
    }
    filtered.sort((a, b) => a.status.localeCompare(b.status));
    setFilteredTokens(filtered);
  };

  return (
    <div className="flex">
      {/* Left Side: Tokens Table */}
      <div className="w-1/2 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold mb-4">Tokens</h2>

          <div className="text-gray-600 px-8 mb-4">
            <label htmlFor="filterStatus" className="mr-2">
              Filter by Status:
            </label>
            <select
              id="filterStatus"
              className="border px-2 py-1 rounded-lg"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="valid" className="text-black">
                Valid
              </option>
              <option value="used" className="text-black">
                Used
              </option>
              <option value="expired" className="text-black">
                Expired
              </option>
              <option value="reallocated" className="text-black">
                Reallocated
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : tokens.length === 0 ? (
          <p>No tokens found for your outlet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">Token No</th>
                <th className="border-b p-2 text-left">Request ID</th>
                <th className="border-b p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((token) => (
                <tr
                  key={token.token_id}
                  className={`hover:bg-gray-100 cursor-pointer ${
                    selectedToken?.token_id === token.token_id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => handleTokenClick(token)}
                >
                  <td className="border-b p-2">{token.token_no}</td>
                  <td className="border-b p-2">
                    {token.status === "reallocated" ? token.reallocated_to : token.request_id}
                  </td>
                  <td className="border-b p-2 capitalize">{token.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Right Side: Token and Request Details */}
      <div className="w-1/2 px-7 py-3 bg-gray-100 shadow-md">
        {selectedToken && gasRequestDetails ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Details</h2>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Token Details</h3>
              <p className="px-5">
                <strong>Token No:</strong> {""}
                <span className="bg-green-100 text-green-800 border border-green-300 px-2 rounded-lg font-semibold">
                  {selectedToken.token_no}
                </span>
              </p>
              <p className="px-5">
                <strong>Status:</strong> {selectedToken.status}
              </p>
              <p className="px-5">
                <strong>Expire Date: </strong>{" "}
                {new Date(selectedToken.expiry_date).toLocaleDateString()}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Gas Request Details</h3>
              <div className="px-5">
                <strong>Pickup Date:</strong>{" "}
                {new Date(gasRequestDetails.expected_pickup_date).toLocaleDateString()}
              </div>
              <div className="px-5">
                <strong>Cylinder Details:</strong>
                <ul className="list-disc pl-9">
                  {gasRequestDetails.cylinder_details
                    .split(", ")
                    .map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                </ul>
              </div>
              <div className="px-5">
                <strong>Total Payment:</strong> Rs.{gasRequestDetails.total_payment}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Consumer Details</h3>
              <p className="px-5">
                <strong>Name:</strong> {gasRequestDetails.consumer_name}
              </p>
              <p className="px-5">
                <strong>Contact:</strong> {gasRequestDetails.contact}
              </p>
              <p className="px-5">
                <strong>NIC:</strong> {gasRequestDetails.nic}
              </p>
              <p className="px-5">
                <strong>Email:</strong> {gasRequestDetails.email}
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              {(selectedToken?.status === "valid" || selectedToken?.status === "reallocated") && (
                <button className="bg-orange-500 text-white py-2 px-4 rounded-lg" onClick={handleOpenConfirmModal}>
                  Use Token
                </button>
              )}

              {/* Reallocate Button */}
              {selectedToken?.status === "expired" && (
                <button
                  className="bg-orange-500 text-white py-2 px-4 rounded-lg"
                  onClick={async () => {
                    await fetchPendingRequests(); // Fetch pending requests
                    setShowReallocationModal(true); // Open the modal after fetching
                  }}
                >
                  Reallocate
                </button>
              )}

              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                onClick={() => {
                  setSelectedToken(null);
                  setGasRequestDetails(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">----- Token Details -----</p>
        )}
      </div>

      {showReallocationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white p-6 w-2/3 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Pending Gas Requests</h2>
            <button
              className="absolute top-4 right-4 bg-gray-200 rounded-full p-1 hover:bg-gray-300 transition"
              onClick={() => setShowReallocationModal(false)}
            >
              <img src="/close.png" alt="Close" className="w-4 h-4" />
            </button>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">Request ID</th>
                  <th className="border-b p-2 text-left">Consumer</th>
                  <th className="border-b p-2 text-left">Pickup Date</th>
                  <th className="border-b p-2 text-left">Gas Details</th>
                  <th className="border-b p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request) => (
                  <tr key={request.request_id}>
                    <td className="border-b p-2">{request.request_id}</td>
                    <td className="border-b p-2">{request.consumer_name}</td>
                    <td className="border-b p-2">{new Date(request.expected_pickup_date).toLocaleDateString()}</td>
                    <td className="border-b p-2">{request.cylinder_details || "N/A"}</td>
                    <td className="border-b p-2">
                      <button
                        className="bg-orange-500 text-white py-1 px-3 rounded-lg"
                        onClick={() => {
                          handleReallocate(request.request_id);
                          setShowReallocationModal(false);
                        }}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white p-6 w-1/2 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Token Usage</h2>
            <div className="mb-4 px-5">
              <strong>Please ensure that the consumer has returned empty cylinders:</strong>
              <ul className="list-disc pl-9">
                {gasRequestDetails.cylinder_details
                  .split(", ")
                  .map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
              </ul>
            </div>
            <p className="px-9 text-red-500">
              Are you sure you want to proceed with using this token?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-orange-500 text-white py-2 px-4 rounded-lg"
                onClick={handleConfirmUseToken} // Proceed with the OTP generation process
              >
                Complete
              </button>
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                onClick={() => setShowConfirmModal(false)} // Close the modal
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 w-1/3 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Enter OTP</h2>
            <p className="mb-4">An OTP has been sent to the consumer's email. Please enter it below:</p>
            <input
              type="text"
              className="border px-2 py-1 w-full rounded-lg mb-4"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-orange-500 text-white py-2 px-4 rounded-lg"
                onClick={handleVerifyOtp}
              >
                Verify OTP
              </button>
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default ViewTokens;

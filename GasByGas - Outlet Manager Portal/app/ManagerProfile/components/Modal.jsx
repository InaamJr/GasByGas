const Modal = ({ title, children, onClose, selectedRequest, managerId }) => {
  const handleAction = async (action) => {
    if (!selectedRequest || !managerId) {
      alert("No request selected or manager not authenticated.");
      return;
    }

    try {
      if (action === "accepted") {
        // Generate token when the request is accepted
        const tokenResponse = await fetch("/api/manager/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: selectedRequest.request_id,
            managerId: managerId, // Pass the manager ID
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
      }

      // Update request status
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
        onClose(); // Close the modal and refresh requests
      } else {
        const errorData = await statusResponse.json();
        alert(`Failed to ${action} request: ${errorData.error}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error.message);
      alert(`An error occurred while trying to ${action} the request.`);
    }
  };

  // Function to determine status styles dynamically
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (!selectedRequest) {
    return null; // Return null if no selectedRequest is provided
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg p-6 w-auto relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 bg-gray-200 rounded-full p-1 hover:bg-gray-300 transition"
          onClick={onClose}
        >
          <img src="/close.png" alt="Close" className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>

        {/* Modal Content */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              Consumer Data
            </h3>
            {children.consumerData}
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              Request Details
            </h3>
            {children.requestDetails}
            {/* Styled Status */}
            <p
              className={`flex justify-center items-center px-2 py-1 mt-3 rounded-lg border text-sm font-semibold ${getStatusStyles(
                selectedRequest.status
              )}`}
            >
              {selectedRequest.status}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {selectedRequest.status === "pending" && ( // Conditionally render buttons
          <div className="mt-6 flex justify-end space-x-4">
            <button
              className="bg-orange-500 text-white py-2 px-4 rounded-lg"
              onClick={() => handleAction("accepted")}
            >
              Accept
            </button>
            <button
              className="bg-gray-500 text-white py-2 px-4 rounded-lg ml-4"
              onClick={() => handleAction("rejected")}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

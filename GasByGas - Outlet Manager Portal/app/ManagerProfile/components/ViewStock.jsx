"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register components
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const ViewStock = ({ outletId }) => {
  const [transactions, setTransactions] = useState([]);
  const [currentStock, setCurrentStock] = useState([]);
  const [transactionType, setTransactionType] = useState("in");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(""); // For filtering by gas type
  const [sortOrder, setSortOrder] = useState("date"); // Sort by date or gas type

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/manager/fetch-stock-transactions", {
        method: "GET",
        headers: {
          "outlet-id": outletId,
          "transaction-type": transactionType,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      } else {
        console.error("Failed to fetch transactions:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentStock = async () => {
    try {
      const response = await fetch("/api/manager/fetch-current-stock", {
        method: "GET",
        headers: { "outlet-id": outletId },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentStock(data.stock);
      } else {
        console.error("Failed to fetch current stock levels:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching current stock levels:", error);
    }
  };

  useEffect(() => {
    if (outletId) {
      fetchTransactions();
      fetchCurrentStock();
    }
  }, [outletId, transactionType]);

  // Filter transactions by gas type
  const filteredTransactions = transactions.filter((transaction) =>
    filterType ? transaction.cylinder_name === filterType : true
  );

  // Sort transactions by date or gas type
  const sortedTransactions = filteredTransactions.sort((a, b) => {
    if (sortOrder === "date") {
      return new Date(b.transaction_date) - new Date(a.transaction_date); // Sort by date descending
    } else if (sortOrder === "gasType") {
      return a.cylinder_name.localeCompare(b.cylinder_name); // Sort alphabetically by gas type
    }
    return 0;
  });
  // Debugging sorted transactions
  console.log("Sorted Transactions:", sortedTransactions);

  const chartData = {
    labels: currentStock.map((stock) => stock.cylinder_name),
    datasets: [
      {
        label: "Current Stock Levels",
        data: currentStock.map((stock) => stock.quantity),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  // Helper function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return dateString;
  };

  return (
      <div className="flex">
      {/* Transactions Table */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">Stock Details</h2>

        {/* Transaction Type Toggle */}
        <div className="flex justify-center items-center mt-4 mb-6">
          <div className="flex rounded-lg bg-gray-600 p-1 shadow-md">
            <button
              className={`py-2 px-5 text-sm font-semibold transition-all duration-300 ${
                transactionType === "in" ? "bg-white text-black rounded-lg shadow-md" : "text-white bg-transparent"
              }`}
              onClick={() => setTransactionType("in")}
            >
              In
            </button>
            <button
              className={`py-2 px-5 text-sm font-semibold transition-all duration-300 ${
                transactionType === "out" ? "bg-white text-black rounded-lg shadow-md" : "text-white bg-transparent"
              }`}
              onClick={() => setTransactionType("out")}
            >
              Out
            </button>
          </div>
        </div>

        {/* Filters and Sort Options */}
        <div className="flex justify-between items-center mb-4">
          {/* Filter by Gas Type */}
          <select
            className="border border-gray-400 rounded-lg px-1 py-1"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Gas Types</option>
            {currentStock.map((stock) => (
              <option key={stock.cylinder_name} value={stock.cylinder_name}>
                {stock.cylinder_name}
              </option>
            ))}
          </select>

          {/* Sort Options */}
          <select
            className="border border-gray-400 rounded-lg px-1 py-1"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="gasType">Sort by Gas Type</option>
          </select>
        </div>

        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2 text-left">Cylinder Name</th>
                <th className="border-b p-2 text-left">Quantity</th>
                <th className="border-b p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="border-b p-2">{transaction.cylinder_name}</td>
                  <td className="border-b p-2">{transaction.quantity}</td>
                  <td className="border-b p-2">{formatDate(transaction.transaction_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stock Chart */}
      <div className="w-1/2 p-4">
        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default ViewStock;

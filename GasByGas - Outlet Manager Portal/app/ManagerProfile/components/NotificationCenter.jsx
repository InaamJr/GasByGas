"use client";

import React, { useEffect, useState } from "react";

const NotificationCenter = ({ managerId, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/manager/fetch-notifications", {
        method: "GET",
        headers: { "manager-id": managerId },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      } else {
        const error = await response.json();
        console.error("Failed to fetch notifications:", error.error);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch("/api/manager/mark-notification-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification.notification_id !== notificationId
          )
        );
      } else {
        console.error("Failed to mark notification as read.");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
    }
  };

  useEffect(() => {
    if (managerId) fetchNotifications();
  }, [managerId]);

  return (
    <div className="p-3">
      <h2 className="text-lg font-bold mb-2">Notifications</h2>
      <button
        className="absolute top-4 right-4 bg-gray-200 rounded-full p-1 hover:bg-gray-300 transition"
        onClick={onClose}
      >
        <img src="/close.png" alt="Close" className="w-4 h-4" />
      </button>
      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <li
              key={notification.notification_id}
              className="py-2 flex justify-between items-center"
            >
              <div>
                <p className="text-gray-700">{notification.message}</p>
                <small className="text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </small>
              </div>
              <button
                onClick={() => markNotificationAsRead(notification.notification_id)}
                className="p-1"
              >
                <img
                  src="/bin.png"
                  alt="Mark as read"
                  className="w-8 h-1/2 text-red-500 hover:text-red-700"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationCenter;

import cron from "node-cron";
import generateNotifications from "./app/api/manager/scheduled-notifications.js";
import { sendNotificationsForNextDayDeliveries, sendPickupReminders } from "./app/utils/notificationUtils.js";

// Schedule delivery notifications to run daily at 7 AM
cron.schedule("0 7 * * *", async () => {
  console.log("Running daily delivery notification task...");
  await sendNotificationsForNextDayDeliveries();
});

// Schedule pickup reminders to run daily at 12 PM (noon)
cron.schedule("0 1 * * *", async () => {
  console.log("Running daily pickup reminder task...");
  await sendPickupReminders();
});
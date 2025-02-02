import cron from "node-cron";
import { generateNotifications } from "@/utils/generateNotifications";

// Schedule the script to run daily at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running scheduled notification script...");
  generateNotifications();
});

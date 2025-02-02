import { sendNotificationsForNextDayDeliveriesForOutlet } from "../../../utils/notificationUtils";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(req) {
  try {
    const managerId = req.headers.get("manager-id");

    if (!managerId) {
      return new Response("Manager ID is required", { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Fetch outlet ID for the logged-in manager
    const [outletRows] = await connection.query(
      `SELECT outlet_id FROM outlet WHERE manager_id = ? AND status = 'active'`,
      [managerId]
    );

    if (outletRows.length === 0) {
      return new Response("No active outlet found for this manager.", { status: 404 });
    }

    const outletId = outletRows[0].outlet_id;

    // Call the updated function for the specific outlet
    await sendNotificationsForNextDayDeliveriesForOutlet(outletId);

    await connection.end();

    return new Response("Notifications sent successfully!", { status: 200 });
  } catch (error) {
    console.error("Error sending notifications:", error.message);
    return new Response("Failed to send notifications.", { status: 500 });
  }
}

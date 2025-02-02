import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function generateNotificationsForOutlet(outletId) {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Fetch the outlet details
    const [outlet] = await connection.query(
      `SELECT outlet_name FROM outlet WHERE outlet_id = ? AND status = 'active'`,
      [outletId]
    );

    if (outlet.length === 0) {
      console.error(`No active outlet found with ID: ${outletId}`);
      return;
    }

    const outletName = outlet[0].outlet_name;

    // Today's date and 7 days from now
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Step 1: Check the stock for the outlet
    const [lowStockItems] = await connection.query(
      `SELECT 
         os.cylinder_type_id, 
         ct.name AS cylinder_name, 
         os.quantity 
       FROM outlet_stock os
       JOIN cylinder_types ct ON os.cylinder_type_id = ct.type_id
       WHERE os.outlet_id = ? AND os.quantity < 5`,
      [outletId]
    );

    for (const item of lowStockItems) {
      const { cylinder_type_id, cylinder_name, quantity } = item;

      // Step 2: Check if there are any scheduled deliveries for this gas type
      const [deliveries] = await connection.query(
        `SELECT COUNT(*) AS delivery_count
         FROM delivery_schedule ds
         JOIN outlet_order oo ON ds.order_id = oo.order_id
         JOIN order_details od ON oo.order_id = od.order_id
         WHERE oo.outlet_id = ?
           AND od.cylinder_type_id = ?
           AND ds.delivery_date BETWEEN ? AND ?
           AND od.status = 'scheduled'`,
        [outletId, cylinder_type_id, today, nextWeek]
      );

      if (deliveries[0].delivery_count === 0) {
        // Step 3: Generate a notification for low stock with no scheduled deliveries
        await connection.query(
          `INSERT INTO notifications (outlet_id, message, created_at) 
           VALUES (?, ?, NOW())`,
          [
            outletId,
            `The cylinder "${cylinder_name}" has critically low stock (${quantity}). No scheduled deliveries for the next 7 days. Please restock urgently.`,
          ]
        );
      }
    }

    console.log(`Notifications generated successfully for outlet ID: ${outletId}`);
  } catch (error) {
    console.error("Error generating notifications:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}
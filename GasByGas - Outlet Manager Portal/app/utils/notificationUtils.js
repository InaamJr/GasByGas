import mysql from "mysql2/promise";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// SMTP Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNotificationsForNextDayDeliveriesForOutlet(outletId) {
    let connection;
  
    if (!outletId) {
      console.error("Outlet ID is required to send notifications.");
      return;
    }
  
    try {
      connection = await mysql.createConnection(dbConfig);
  
      // Fetch orders scheduled for the next day for the specific outlet
      const [orders] = await connection.query(
        `SELECT 
          o.order_id, 
          o.outlet_id, 
          o.expected_delivery_date, 
          ot.outlet_name
         FROM outlet_order o
         JOIN outlet ot ON o.outlet_id = ot.outlet_id
         WHERE o.expected_delivery_date = CURDATE() + INTERVAL 1 DAY AND o.outlet_id = ?`,
        [outletId]
      );
  
      if (orders.length === 0) {
        console.log(`No scheduled deliveries for outlet ID ${outletId} for the next day.`);
        return; // Exit the function if there are no orders
      }
  
      for (const order of orders) {
        const { outlet_name, expected_delivery_date } = order;
  
        // Fetch consumers with valid tokens expiring soon (within next 7 days)
        const [consumers] = await connection.query(
          `SELECT 
            c.email, 
            c.name,
            t.expiry_date
           FROM token t
           JOIN gas_request gr ON t.request_id = gr.request_id
           JOIN consumer c ON gr.consumer_id = c.consumer_id
           WHERE gr.outlet_id = ? 
             AND t.status = 'valid'
             AND t.expiry_date BETWEEN CURDATE() AND CURDATE() + INTERVAL 7 DAY`,
          [outletId]
        );
  
        if (consumers.length === 0) {
          console.log(`No consumers with valid tokens for outlet ID: ${outletId}`);
          continue; // Skip to the next order if no consumers are found
        }
  
        for (const consumer of consumers) {
          const { email, name, expiry_date } = consumer;
  
          // Prepare email content
          const emailSubject = `Reminder: Gas Cylinders Available from Tomorrow!`;
          const emailBody = `Dear ${name},\n\n
            This is a friendly reminder that your gas cylinders will be available for pickup tomorrow at ${outlet_name}.
            Your token is valid until ${new Date(expiry_date).toLocaleDateString()}.
            
            Please visit the outlet for your cylinders and ensure you bring your token.
  
            Thank you for choosing GasByGas!
            
            Best regards,
            GasByGas Team`;
  
          // Send the email
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: emailSubject,
            text: emailBody,
          });
  
          console.log(`Notification sent to ${email}`);
        }
      }
  
      console.log(`Notification process completed for outlet ID: ${outletId}`);
    } catch (error) {
      console.error("Error sending notifications:", error.message);
    } finally {
      if (connection) await connection.end();
    }
  }

// Function to send pickup reminders  
export async function sendPickupReminders() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Fetch gas requests with pickup date tomorrow for both general and business consumers
    const [requests] = await connection.query(
      `SELECT 
        gr.request_id,
        gr.expected_pickup_date,
        c.name,
        c.email,
        c.consumer_type,
        o.outlet_name,
        GROUP_CONCAT(
          CONCAT(ct.name, ' (', grd.quantity, ')')
          SEPARATOR ', '
        ) as cylinder_details
      FROM gas_request gr
      JOIN consumer c ON gr.consumer_id = c.consumer_id
      JOIN outlet o ON gr.outlet_id = o.outlet_id
      JOIN gas_request_details grd ON gr.request_id = grd.request_id
      JOIN cylinder_types ct ON grd.cylinder_type_id = ct.type_id
      WHERE gr.expected_pickup_date = CURDATE() + INTERVAL 1 DAY
      AND gr.status = 'accepted'
      GROUP BY gr.request_id`
    );

    if (requests.length === 0) {
      console.log('No pickup reminders to send for tomorrow.');
      return;
    }

    for (const request of requests) {
      const {
        name,
        email,
        consumer_type,
        outlet_name,
        expected_pickup_date,
        cylinder_details
      } = request;

      // Customize email subject and content based on consumer type
      const emailSubject = `Reminder: Gas Cylinder Pickup Tomorrow - ${outlet_name}`;
      
      let emailBody = `Dear ${name},\n\n`;
      emailBody += `This is a friendly reminder that your gas cylinder order is scheduled for pickup tomorrow (${new Date(expected_pickup_date).toLocaleDateString()}) at ${outlet_name}.\n\n`;
      emailBody += `Order Details:\n${cylinder_details}\n\n`;
      
      if (consumer_type === 'business') {
        emailBody += 'Please ensure to bring your business identification and authorization documents for pickup.\n\n';
      } else {
        emailBody += 'Please bring a valid ID for verification during pickup.\n\n';
      }
      
      emailBody += 'If you are unable to pickup tomorrow, please contact the outlet directly to make alternative arrangements.\n\n';
      emailBody += 'Thank you for choosing GasByGas!\n\n';
      emailBody += 'Best regards,\nGasByGas Team';

      // Send the email
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: emailSubject,
        text: emailBody,
      });

      console.log(`Pickup reminder sent to ${email} for request ID: ${request.request_id}`);
    }
  } catch (error) {
    console.error('Error sending pickup reminders:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
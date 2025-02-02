import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function POST(req) {
  try {
    // Parse the form data from the request
    const formData = await req.formData();
    const data = {
      Outlet_RegistrationID: formData.get("Outlet_RegistrationID"),
      Outlet_Name: formData.get("Outlet_Name"),
      Outlet_Address: formData.get("Outlet_Address"),
      Outlet_Certificate: formData.get("Outlet_Certificate"),
      Manager_Name: formData.get("Manager_Name"),
      NIC: formData.get("NIC"),
      Email: formData.get("Email"),
      Contact_No: formData.get("Contact_No"),
      Password: formData.get("Password"),
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.Password, 10); // Salt rounds: 10

    // Convert the certificate file into a Blob for storage
    const certificateBlob = Buffer.from(await data.Outlet_Certificate.arrayBuffer());

    // Create a database connection
    const connection = await mysql.createConnection(dbConfig);

    // Insert the data into the outlet_manager table
    const query = `
      INSERT INTO outlet_manager (
        outlet_registration_id,
        outlet_name,
        outlet_address,
        outlet_certificate,
        manager_name,
        nic,
        email,
        contact_no,
        password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.Outlet_RegistrationID,
      data.Outlet_Name,
      data.Outlet_Address,
      certificateBlob,
      data.Manager_Name,
      data.NIC,
      data.Email,
      data.Contact_No,
      hashedPassword, // Save the hashed password
    ];

    await connection.execute(query, values);

    // Close the database connection
    await connection.end();

    // Return a success response
    return NextResponse.json(
      { message: "Registration request sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling registration request:", error);
    return NextResponse.json(
      { error: "Failed to process the registration request" },
      { status: 500 }
    );
  }
}

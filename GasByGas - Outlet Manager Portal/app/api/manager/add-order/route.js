import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { outlet_id, expectedDeliveryDate, orderDetails } = body;

    if (!outlet_id || !expectedDeliveryDate || !orderDetails?.length) {
      return NextResponse.json(
        { error: "Missing required fields: outlet_id, expectedDeliveryDate, or orderDetails" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Insert into outlet_order
    const [orderResult] = await connection.query(
      `INSERT INTO outlet_order (outlet_id, order_date, expected_delivery_date) 
       VALUES (?, NOW(), ?)`,
      [outlet_id, expectedDeliveryDate]
    );

    if (orderResult.affectedRows === 0) {
      await connection.end();
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const order_id = orderResult.insertId;

    // Insert order details
    const orderDetailsValues = orderDetails.map((detail) => [
      order_id,
      detail.cylinder_type_id,
      detail.quantity,
    ]);

    const [detailsResult] = await connection.query(
      `INSERT INTO order_details (order_id, cylinder_type_id, quantity) 
       VALUES ?`,
      [orderDetailsValues]
    );

    if (detailsResult.affectedRows === 0) {
      await connection.end();
      return NextResponse.json({ error: "Failed to insert order details" }, { status: 500 });
    }

    await connection.end();

    return NextResponse.json({ message: "Order added successfully", order_id });
  } catch (error) {
    console.error("Error adding order:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

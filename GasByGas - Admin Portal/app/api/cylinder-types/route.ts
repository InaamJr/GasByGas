import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper function to check super admin authorization
async function checkSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, error: "Not authenticated" };
  }
  if (!session.user.isSuperAdmin) {
    return { authorized: false, error: "Unauthorized. Super Admin access required." };
  }
  return { authorized: true };
}

export async function GET() {
  try {
    const auth = await checkSuperAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const [rows] = await db.query(
      "SELECT type_id, name, description, CAST(weight_kg AS DECIMAL(5,2)) as weight_kg, CAST(price AS DECIMAL(10,2)) as price FROM cylinder_types ORDER BY name"
    );

    // Convert string numbers to actual numbers
    const formattedRows = (rows as any[]).map(row => ({
      ...row,
      weight_kg: Number(row.weight_kg),
      price: Number(row.price)
    }));

    return NextResponse.json(formattedRows || []);
  } catch (error) {
    console.error("Error fetching cylinder types:", error);
    return NextResponse.json(
      { error: "Failed to fetch cylinder types" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkSuperAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const { name, description, weight_kg, price } = await request.json();

    // Validate required fields
    if (!name || !weight_kg || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate data types and ranges
    if (typeof name !== 'string' || name.length > 20) {
      return NextResponse.json(
        { error: "Invalid name. Must be string and maximum 20 characters." },
        { status: 400 }
      );
    }

    if (description && (typeof description !== 'string' || description.length > 100)) {
      return NextResponse.json(
        { error: "Invalid description. Must be string and maximum 100 characters." },
        { status: 400 }
      );
    }

    const weightNum = parseFloat(weight_kg);
    const priceNum = parseFloat(price);

    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 999.99) {
      return NextResponse.json(
        { error: "Invalid weight. Must be a positive number less than 1000." },
        { status: 400 }
      );
    }

    if (isNaN(priceNum) || priceNum <= 0 || priceNum > 99999999.99) {
      return NextResponse.json(
        { error: "Invalid price. Must be a positive number." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO cylinder_types (name, description, weight_kg, price) VALUES (?, ?, ?, ?)",
      [name, description || null, weightNum, priceNum]
    );

    return NextResponse.json(
      { message: "Cylinder type added successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding cylinder type:", error);
    
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A cylinder type with this name already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add cylinder type" },
      { status: 500 }
    );
  }
}

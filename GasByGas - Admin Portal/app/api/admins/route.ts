import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Admin extends RowDataPacket {
  admin_id: number;
  name: string;
  username: string;
  email: string;
  contact: string;
  is_super_admin: boolean;
  status: string;
}

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

    const [rows] = await db.query<Admin[]>(
      'SELECT admin_id, name, username, email, contact, is_super_admin, status FROM head_office_admin WHERE status != ?',
      ['deleted']
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received admin creation request');
    
    const auth = await checkSuperAdmin();
    if (!auth.authorized) {
      console.log('Authorization failed:', auth.error);
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const formData = await request.formData();
    console.log('Received form data:', Object.fromEntries(formData.entries()));
    
    // Extract fields from FormData
    const body = {
      name: formData.get('name')?.toString().trim(),
      nic: formData.get('nic')?.toString().trim(),
      contact: formData.get('contact')?.toString().trim(),
      email: formData.get('email')?.toString().trim(),
      username: formData.get('username')?.toString().trim(),
      password: formData.get('password')?.toString(),
      is_super_admin: formData.get('is_super_admin') === 'true',
      status: 'active'
    };

    console.log('Processed body:', { ...body, password: '[REDACTED]' });

    // Validate required fields
    const requiredFields = ['name', 'nic', 'contact', 'email', 'username', 'password'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log('Missing required field:', field);
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate formats
    if (!/^\d{12}$/.test(body.nic)) {
      console.log('Invalid NIC format:', body.nic);
      return NextResponse.json(
        { error: 'NIC must be 12 digits' },
        { status: 400 }
      );
    }

    if (!/^\+94\d{9}$/.test(body.contact)) {
      console.log('Invalid contact format:', body.contact);
      return NextResponse.json(
        { error: 'Contact must be in format: +94XXXXXXXXX' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      console.log('Invalid email format:', body.email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if username, email, nic, or contact already exists
    console.log('Checking for existing user with same credentials');
    const [existingUsers] = await db.query<Admin[]>(
      'SELECT username, email, nic, contact FROM head_office_admin WHERE username = ? OR email = ? OR nic = ? OR contact = ?',
      [body.username, body.email, body.nic, body.contact]
    );

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.username === body.username) {
        console.log('Username already exists:', body.username);
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
      if (existing.email === body.email) {
        console.log('Email already exists:', body.email);
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
      if (existing.nic === body.nic) {
        console.log('NIC already exists:', body.nic);
        return NextResponse.json({ error: 'NIC already exists' }, { status: 400 });
      }
      if (existing.contact === body.contact) {
        console.log('Contact already exists:', body.contact);
        return NextResponse.json({ error: 'Contact number already exists' }, { status: 400 });
      }
    }

    // Handle profile image
    let profileImageBuffer = null;
    const profileImage = formData.get('profile_image') as File | null;
    
    if (profileImage) {
      console.log('Processing profile image');
      if (!profileImage.type.startsWith('image/')) {
        console.log('Invalid image type:', profileImage.type);
        return NextResponse.json(
          { error: 'Invalid file type. Please upload an image.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await profileImage.arrayBuffer();
      profileImageBuffer = Buffer.from(arrayBuffer);
      console.log('Profile image processed successfully');
    }

    console.log('Inserting new admin into database');
    // Insert new admin
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO head_office_admin 
       (name, nic, contact, email, username, password, is_super_admin, status, profile_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.nic,
        body.contact,
        body.email,
        body.username,
        body.password,
        body.is_super_admin ? 1 : 0,
        body.status,
        profileImageBuffer
      ]
    );

    console.log('Admin created successfully with ID:', result.insertId);
    return NextResponse.json(
      { message: 'Admin created successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating admin:', error);
    console.error('Error stack:', error.stack);
    
    if (error.code === 'ER_DUP_ENTRY') {
      const field = error.message.includes('email_UNIQUE') ? 'email' :
                   error.message.includes('username_UNIQUE') ? 'username' :
                   error.message.includes('nic_UNIQUE') ? 'NIC' :
                   error.message.includes('contact_UNIQUE') ? 'contact' : 'field';
      
      console.log('Duplicate entry error for field:', field);
      return NextResponse.json(
        { error: `This ${field} is already in use` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create admin: ' + error.message },
      { status: 500 }
    );
  }
}
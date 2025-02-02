import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import pool from '@/lib/db';
import { sendEmail, generatePasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Check if email exists in head_office_admin table
      const [admins] = await connection.execute(
        'SELECT admin_id, email FROM head_office_admin WHERE email = ? AND status = ?',
        [email, 'active']
      );

      if (!Array.isArray(admins) || admins.length === 0) {
        return NextResponse.json(
          { error: 'No active account found with this email' },
          { status: 404 }
        );
      }

      // Generate reset token
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Save token to database
      await connection.execute(
        'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expiresAt]
      );

      // Generate reset link with absolute URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetLink = `${baseUrl}/reset-password?token=${token}`;
      
      console.log('Generated reset link:', resetLink); // Debug log
      
      // Send email
      await sendEmail({
        to: email,
        subject: 'Reset Your Password - GasByGas Admin',
        html: generatePasswordResetEmail(resetLink),
      });

      return NextResponse.json(
        { message: 'Password reset instructions sent to your email' },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

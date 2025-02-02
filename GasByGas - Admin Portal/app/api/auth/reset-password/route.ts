import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    try {
      // Verify token
      const [tokens] = await connection.execute(
        'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = 0',
        [token]
      );

      if (!tokens || !(tokens as any[]).length) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 400 }
        );
      }

      const resetToken = (tokens as any[])[0];

      // Update password
      await connection.execute(
        'UPDATE head_office_admin SET password = ? WHERE email = ?',
        [password, resetToken.email]
      );

      // Mark token as used
      await connection.execute(
        'UPDATE password_reset_tokens SET used = 1 WHERE token = ?',
        [token]
      );

      // Commit transaction
      await connection.commit();

      return NextResponse.json({ message: 'Password reset successfully' });
    } catch (error) {
      // Rollback on error
      if (connection) {
        await connection.rollback();
      }
      throw error;
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

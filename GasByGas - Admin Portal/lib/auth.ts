import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const connection = await pool.getConnection();
          const [rows] = await connection.execute(
            'SELECT * FROM head_office_admin WHERE username = ? AND status = ?',
            [credentials.username, 'active']
          );
          connection.release();

          const admin = (rows as any[])[0];
          if (!admin) {
            return null;
          }

          const isPasswordValid = credentials.password === admin.password;
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: admin.admin_id.toString(),
            name: admin.name,
            email: admin.email,
            isSuperAdmin: admin.is_super_admin === 1
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = user.isSuperAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.isSuperAdmin = token.isSuperAdmin;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET
};

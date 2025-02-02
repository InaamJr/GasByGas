import { Pool, PoolConnection } from 'mysql2/promise';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}

declare module '@/lib/db' {
  const pool: Pool;
  export default pool;
}

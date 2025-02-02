import { RowDataPacket } from 'mysql2';

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function parseDbResponse<T>(rows: RowDataPacket[]): T[] {
  return JSON.parse(JSON.stringify(rows)) as T[];
}
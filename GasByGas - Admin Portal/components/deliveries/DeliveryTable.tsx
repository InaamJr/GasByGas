'use client';

import { DataTable } from '@/components/ui/data-table';
import { format } from 'date-fns';

interface Delivery {
  id: number;
  customer: string;
  deliveryDate: string;
  status: string;
  address: string;
}

interface DeliveryTableProps {
  deliveries: Delivery[];
}

const columns = [
  { key: 'customer', label: 'Customer' },
  { 
    key: 'deliveryDate', 
    label: 'Delivery Date',
    render: (date: string) => format(new Date(date), 'MMM dd, yyyy')
  },
  { key: 'status', label: 'Status' },
  { key: 'address', label: 'Delivery Address' },
];

export function DeliveryTable({ deliveries }: DeliveryTableProps) {
  return (
    <DataTable
      columns={columns}
      data={deliveries}
      className="w-full"
    />
  );
}
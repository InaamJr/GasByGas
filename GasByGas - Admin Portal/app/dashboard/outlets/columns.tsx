'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

interface Outlet {
  outlet_id: number;
  outlet_name: string;
  district: string;
  status: string;
  manager_id: number;
  outlet_registration_id: string;
  manager_name: string;
  nic: string;
  email: string;
  contact_no: string;
  verification_status: string;
  verification_date: string | null;
}

export const columns: ColumnDef<Outlet>[] = [
  {
    accessorKey: 'outlet_registration_id',
    header: 'Registration ID',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('outlet_registration_id')}
      </div>
    ),
  },
  {
    accessorKey: 'outlet_name',
    header: 'Outlet Name',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('outlet_name')}
      </div>
    ),
  },
  {
    accessorKey: 'district',
    header: 'District',
    cell: ({ row }) => (
      <div>
        {row.getValue('district')}
      </div>
    ),
  },
  {
    accessorKey: 'manager_name',
    header: 'Manager',
    cell: ({ row }) => (
      <div>
        {row.getValue('manager_name')}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'success' : 'destructive'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'verification_status',
    header: 'Verification',
    cell: ({ row }) => {
      const status = row.getValue('verification_status') as string;
      const variant = 
        status === 'accepted' ? 'success' :
        status === 'pending' ? 'warning' :
        'destructive';
      
      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      );
    },
  },
];

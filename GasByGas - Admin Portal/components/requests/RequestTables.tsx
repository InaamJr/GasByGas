'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';

const mockOutletRequests = [
  { 
    id: 1, 
    name: 'Gas Station A', 
    location: 'City Center', 
    type: 'Outlet', 
    status: 'Pending',
    documentUrl: '/outlet-doc-1.pdf'
  },
  { 
    id: 2, 
    name: 'Gas Station B', 
    location: 'Suburb', 
    type: 'Outlet', 
    status: 'Pending',
    documentUrl: '/outlet-doc-2.pdf'
  },
];

const mockBusinessRequests = [
  { 
    id: 1, 
    businessName: 'ABC Gas Company', 
    ownerName: 'John Doe',
    documentUrl: '/business-doc-1.pdf',
    status: 'Pending'
  },
  { 
    id: 2, 
    businessName: 'XYZ Gas Services', 
    ownerName: 'Jane Smith',
    documentUrl: '/business-doc-2.pdf',
    status: 'Pending'
  },
];

const outletColumns = [
  { key: 'name', label: 'Name' },
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status' },
];

const businessColumns = [
  { key: 'businessName', label: 'Business Name' },
  { key: 'ownerName', label: 'Owner Name' },
  { key: 'status', label: 'Status' },
];

interface RequestTablesProps {
  onSelectRequest: (request: any) => void;
}

export function RequestTables({ onSelectRequest }: RequestTablesProps) {
  const [activeTab, setActiveTab] = useState('outlets');

  return (
    <Card className="p-6 rounded-[20px]">
      <Tabs defaultValue="outlets" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="outlets">Outlet Requests</TabsTrigger>
          <TabsTrigger value="business">Business Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="outlets">
          <h3 className="text-lg font-medium mb-4">Pending Outlet Requests</h3>
          <DataTable
            columns={outletColumns}
            data={mockOutletRequests}
            onRowClick={(row) => onSelectRequest({ ...row, requestType: 'outlet' })}
          />
        </TabsContent>

        <TabsContent value="business">
          <h3 className="text-lg font-medium mb-4">Pending Business Requests</h3>
          <DataTable
            columns={businessColumns}
            data={mockBusinessRequests}
            onRowClick={(row) => onSelectRequest({ ...row, requestType: 'business' })}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
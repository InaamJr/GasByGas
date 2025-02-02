'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OrderDetailsProps {
  order: any;
  onAccept: () => void;
  onReject: () => void;
}

export function OrderDetails({ order, onAccept, onReject }: OrderDetailsProps) {
  if (!order) return null;

  return (
    <Card className="p-6 rounded-[20px]">
      <h3 className="text-lg font-medium mb-4">Pending Order Details</h3>
      <div className="space-y-4">
        <pre className="bg-gray-50 p-4 rounded-lg">
          {JSON.stringify(order, null, 2)}
        </pre>
        <div className="flex justify-end gap-4">
          <Button 
            variant="destructive" 
            className="rounded-full"
            onClick={onReject}
          >
            Reject Order
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 rounded-full"
            onClick={onAccept}
          >
            Accept and Schedule Order
          </Button>
        </div>
      </div>
    </Card>
  );
}
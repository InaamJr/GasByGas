'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface StockItem {
  cylinder_type_id: number;
  name: string;
  quantity: number;
  total_capacity: number;
  last_updated: string;
}

export function OutletStock({ outletId }: { outletId: number }) {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (outletId) {
      fetchStock();
    }
  }, [outletId]);

  const fetchStock = async () => {
    try {
      const response = await fetch(`/api/outlets/${outletId}/stock`);
      if (!response.ok) throw new Error('Failed to fetch stock');
      const data = await response.json();
      setStock(data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading stock information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Status</CardTitle>
        <CardDescription>Current gas cylinder inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stock.map((item) => (
            <div key={item.cylinder_type_id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(item.last_updated).toLocaleString()}
                  </p>
                </div>
                <Badge variant={item.quantity < 10 ? 'destructive' : 'default'}>
                  {item.quantity} available
                </Badge>
              </div>
              <Progress
                value={(item.quantity / item.total_capacity) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

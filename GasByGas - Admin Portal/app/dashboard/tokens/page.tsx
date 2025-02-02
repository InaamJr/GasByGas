'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Calendar, Store, Phone, User, Tag, CheckCircle, RefreshCw, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface Cylinder {
  type: string;
  weight_kg: number;
  quantity: number;
}

interface Token {
  id: number;
  token_no: string;
  generated_date: string;
  expiry_date: string;
  status: 'valid' | 'used' | 'expired' | 'reallocated';
  reallocation_status?: 'reallocated';
  request: {
    id: number;
    date: string;
    expected_pickup_date: string;
    status: string;
  };
  consumer: {
    id: number;
    name: string;
    contact_no: string;
    type: string;
  };
  outlet: {
    name: string;
    district: string;
  };
  cylinders: Cylinder[];
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tokens');
      if (!response.ok) throw new Error('Failed to fetch tokens');
      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tokens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tokenId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/tokens', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token_id: tokenId,
          status: newStatus
        }),
      });

      if (!response.ok) throw new Error('Failed to update token status');
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: data.message,
      });

      setSelectedToken(null);
      fetchTokens();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update token status',
        variant: 'destructive',
      });
    }
  };

  const filteredTokens = filterStatus === 'all'
    ? tokens
    : tokens.filter(token => token.status === filterStatus);

  const statusCounts = tokens.reduce((acc, token) => {
    acc[token.status] = (acc[token.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'reallocated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gas Tokens</h1>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Total Tokens</h3>
              <p className="text-3xl font-bold">{tokens.length}</p>
            </div>
            <Tag className="h-8 w-8" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Valid</h3>
              <p className="text-3xl font-bold">
                {tokens.filter(t => t.status === 'valid').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Used</h3>
              <p className="text-3xl font-bold">
                {tokens.filter(t => t.status === 'used').length}
              </p>
            </div>
            <CheckSquare className="h-8 w-8" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Expired</h3>
              <p className="text-3xl font-bold">
                {tokens.filter(t => t.status === 'expired').length}
              </p>
            </div>
            <Calendar className="h-8 w-8" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Reallocated</h3>
              <p className="text-3xl font-bold">
                {tokens.filter(t => t.reallocation_status === 'reallocated').length}
              </p>
            </div>
            <RefreshCw className="h-8 w-8" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-[20px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Tokens List</h3>
            <select
              className="px-4 py-2 border rounded-lg"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Tokens</option>
              <option value="valid">Valid</option>
              <option value="used">Used</option>
              <option value="expired">Expired</option>
              <option value="reallocated">Reallocated</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading tokens...</p>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No tokens found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTokens.map((token) => (
                <div
                  key={token.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedToken(token)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Token #{token.token_no}</h4>
                      <p className="text-sm text-gray-500">{token.consumer.name}</p>
                    </div>
                    <Badge className={getStatusColor(token.status)}>
                      {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Expiry: {new Date(token.expiry_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div>
          {selectedToken ? (
            <Card className="p-6 rounded-[20px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Token Details</h3>
                <Badge className={getStatusColor(selectedToken.status)}>
                  {selectedToken.status.charAt(0).toUpperCase() + selectedToken.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Tag className="w-5 h-5 mt-1" />
                  <div>
                    <h4 className="font-medium">Token Information</h4>
                    <p className="text-lg">#{selectedToken.token_no}</p>
                    <p className="text-gray-500">
                      Generated: {new Date(selectedToken.generated_date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-500">
                      Expires: {new Date(selectedToken.expiry_date).toLocaleDateString()}
                    </p>
                    {selectedToken.reallocation_status === 'reallocated' && (
                      <div>
                        <p className="text-sm text-gray-500">Reallocation Status</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Reallocated
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <User className="w-5 h-5 mt-1" />
                  <div>
                    <h4 className="font-medium">Consumer Information</h4>
                    <p className="text-lg">{selectedToken.consumer.name}</p>
                    <p className="text-gray-500">{selectedToken.consumer.contact_no}</p>
                    <Badge className="mt-1">
                      {selectedToken.consumer.type.charAt(0).toUpperCase() + selectedToken.consumer.type.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Store className="w-5 h-5 mt-1" />
                  <div>
                    <h4 className="font-medium">Outlet Information</h4>
                    <p className="text-lg">{selectedToken.outlet.name}</p>
                    <p className="text-gray-500">{selectedToken.outlet.district}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <ClipboardList className="w-5 h-5 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium">Gas Cylinders</h4>
                    <div className="space-y-2 mt-2">
                      {selectedToken.cylinders.map((cylinder, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <div>
                            <span className="font-medium">{cylinder.type}</span>
                            <span className="text-sm text-gray-500 ml-2">({cylinder.weight_kg}kg)</span>
                          </div>
                          <span className="font-medium">{cylinder.quantity} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 rounded-[20px] bg-gray-50">
              <div className="text-center py-8 text-gray-500">
                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Select a token to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
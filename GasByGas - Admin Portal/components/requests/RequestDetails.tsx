'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface RequestDetailsProps {
  request: any;
}

export function RequestDetails({ request }: RequestDetailsProps) {
  if (!request) return null;

  const handleAccept = () => {
    console.log('Accepting request:', request);
  };

  const handleReject = () => {
    console.log('Rejecting request:', request);
  };

  const handleViewDocument = () => {
    if (request.documentUrl) {
      window.open(request.documentUrl, '_blank');
    }
  };

  return (
    <Card className="p-6 rounded-[20px]">
      <h3 className="text-lg font-medium mb-4">Request Details</h3>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          {request.documentUrl && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={handleViewDocument}
                className="w-full flex items-center justify-center gap-2 rounded-lg hover:bg-gray-100"
              >
                <FileText className="h-4 w-4" />
                View {request.requestType === 'outlet' ? 'Outlet' : 'Business'} Document
              </Button>
            </div>
          )}
          <div className="space-y-3">
            {request.requestType === 'outlet' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{request.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{request.location}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="font-medium">{request.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Owner Name</p>
                    <p className="font-medium">{request.ownerName}</p>
                  </div>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{request.status}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            variant="destructive" 
            className="rounded-full"
            onClick={handleReject}
          >
            Reject Request
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 rounded-full"
            onClick={handleAccept}
          >
            Accept Request
          </Button>
        </div>
      </div>
    </Card>
  );
}
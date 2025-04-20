'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Claim {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  policyNumber: string;
  incidentDate: string;
  incidentType: string;
  vehicleBrand: string;
  status: string;
  createdAt: string;
  estimatedCost: number
  };


export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('/api/claims');
        const data = await response.json();
        setClaims(data.claims);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="cursor-pointer hover:bg-gray-50/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "new":
      return "bg-blue-500"
    case "in progress":
      return "bg-yellow-500"
    case "approved":
      return "bg-green-500"
    case "rejected":
      return "bg-red-500"
    case "pending":
      return "bg-orange-500"
    default:
      return "bg-gray-500"
  }
};

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Insurance Claims</h1>
        <p className="text-muted-foreground">Manage and track your insurance claims</p>
      </div>

      <div className="grid gap-6">
        {claims.map((claim) => (
          <Card
            key={claim.id}
            className="cursor-pointer hover:bg-gray-50/50 transition-all duration-300 shadow-sm hover:shadow-md"
            onClick={() => router.push(`/claims/${claim.id}`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold pb-2">{claim.customerName}</CardTitle>
              <Badge
                className={`${getStatusColor(claim.status)} text-slate-400`}
              >
                {claim.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Policy Number</p>
                  <p className="text-base font-semibold">{claim.policyNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Incident Type</p>
                  <p className="text-base font-semibold capitalize">{claim.incidentType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle</p>
                  <p className="text-base font-semibold">{claim.vehicleBrand}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
                  <p className="text-base font-semibold text-green-600">
                    ${claim.estimatedCost?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Created {new Date(claim.createdAt).toLocaleDateString()}
                </span>
                <span className="text-sm text-blue-600 font-medium">View Details →</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {claims.length === 0 && (
          <div className="text-center py-12 bg-gray-50/50 rounded-lg">
            <p className="text-lg text-gray-500">No claims found</p>
            <p className="text-sm text-gray-400">Create a new claim to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
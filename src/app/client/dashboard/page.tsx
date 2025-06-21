"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientDashboard() {
  const { userProfile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!userProfile || userProfile.role !== 'client')) {
      router.push('/login');
    }
  }, [userProfile, isLoading, router]);

  if (isLoading || !userProfile) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-6 w-1/2" />
            <Card className="mt-8">
                <CardHeader>
                    <Skeleton className="h-6 w-1/4 mb-2"/>
                    <Skeleton className="h-4 w-1/3"/>
                </CardHeader>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary font-headline">Client Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Here you can view and manage your bookings.</p>
      
      <Card className="mt-8">
        <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>A list of your past and upcoming moves.</CardDescription>
        </CardHeader>
        {/* Bookings list will go here */}
      </Card>
    </div>
  );
}


"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DriverAvailabilityPage() {
  const { userProfile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!userProfile || userProfile.role !== 'driver')) {
      router.push('/login');
    }
  }, [userProfile, isLoading, router]);

  if (isLoading || !userProfile) {
     return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-6 w-1/2" />
             <div className="mt-8">
                <Skeleton className="h-64 w-full"/>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary font-headline">Manage Availability</h1>
      <p className="mt-2 text-muted-foreground">Set your work hours and block off time.</p>
      
       <div className="mt-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                     <div className="flex justify-center items-center mb-4">
                        <Wrench className="h-12 w-12 text-amber-500" />
                    </div>
                    <CardTitle className="text-2xl">Feature Coming Soon!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">
                        We are currently building a powerful availability management system. Soon, you will be able to set custom working hours, block specific dates, and manage your schedule with ease.
                    </p>
                    <p className="mt-4 text-sm">
                        For now, your availability is set from 8:00 AM to 6:00 PM every day.
                    </p>
                     <Button asChild className="mt-6">
                        <Link href="/driver/dashboard">
                            <CalendarCheck className="mr-2 h-4 w-4"/> Back to Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
      </div>
    </div>
  );
}

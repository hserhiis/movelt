"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Calendar, BookOpen } from 'lucide-react';

export default function DriverDashboard() {
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
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32 w-full"/>
                <Skeleton className="h-32 w-full"/>
                <Skeleton className="h-32 w-full"/>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary font-headline">Driver Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Manage your profile, availability, and view your bookings.</p>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User /> Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">Update your logo, bio, and contact info.</p>
                <Link href="/driver/profile"><Button className="w-full">Edit Profile</Button></Link>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen /> Bookings</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">View and manage all client bookings.</p>
                <Link href="/driver/bookings"><Button className="w-full">View Bookings</Button></Link>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar /> Availability</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">Set your work hours and block off time.</p>
                <Link href="/driver/availability"><Button className="w-full">Manage Slots</Button></Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

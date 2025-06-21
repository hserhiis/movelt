"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Package, XCircle, Ban, PlusCircle } from 'lucide-react';

export default function ClientDashboard() {
  const { userProfile, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && (!userProfile || userProfile.role !== 'client')) {
      router.push('/login');
    }
  }, [userProfile, isAuthLoading, router]);

  useEffect(() => {
    if (userProfile?.uid) {
      setIsLoadingBookings(true);
      const bookingsQuery = query(collection(db, 'bookings'), where('clientId', '==', userProfile.uid));
      
      const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
        const userBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        // Sort bookings by date, most recent first
        userBookings.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateB.getTime() - dateA.getTime();
        });
        setBookings(userBookings);
        setIsLoadingBookings(false);
      });

      return () => unsubscribe();
    }
  }, [userProfile]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'cancelled' });
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not cancel the booking. Please try again.",
      });
    }
  };

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-transit': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (isAuthLoading || !userProfile) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline">My Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Here you can view and manage your bookings.</p>
        </div>
        <Link href="/client/book">
            <Button size="lg"><PlusCircle className="mr-2 h-5 w-5"/> New Booking</Button>
        </Link>
      </div>
      
       <div className="mt-8">
        <h2 className="text-2xl font-semibold font-headline mb-4">My Bookings</h2>
        {isLoadingBookings ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
        ) : bookings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map(booking => (
              <Card key={booking.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">Booking for {format(new Date(booking.date), 'MMMM do')}</CardTitle>
                    <Badge variant={getStatusVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                  </div>
                   <CardDescription className="flex items-center gap-2 pt-2">
                      <Calendar className="h-4 w-4" /> {format(new Date(booking.date), 'EEEE, MMMM do, yyyy')}
                   </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <Clock className="h-4 w-4" /> {booking.startTime} - {booking.endTime}
                   </div>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <Package className="h-4 w-4" /> Vehicle: <span className="capitalize">{booking.vehicleVolume}</span>
                   </div>
                </CardContent>
                <CardFooter>
                  {booking.status === 'pending' && (
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Ban className="mr-2 h-4 w-4" /> Cancel Booking
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently cancel your booking for 
                            {` ${format(new Date(booking.date), 'MMMM do')} at ${booking.startTime}`}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Back</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancelBooking(booking.id!)}>
                            Yes, Cancel Booking
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                   {['completed', 'cancelled', 'in-transit'].includes(booking.status) && (
                      <Button variant="outline" disabled className="w-full">
                          <XCircle className="mr-2 h-4 w-4" /> Cannot Cancel
                      </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8 col-span-full">
            <CardContent>
              <h3 className="text-xl font-semibold">No bookings yet!</h3>
              <p className="text-muted-foreground mt-2">Ready to schedule your move?</p>
              <Button asChild className="mt-4">
                <Link href="/client/book">Book Now</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

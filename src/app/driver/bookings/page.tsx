
"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Booking } from '@/lib/types';
import { format } from 'date-fns';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen } from 'lucide-react';

export default function DriverBookingsPage() {
  const { userProfile, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && (!userProfile || userProfile.role !== 'driver')) {
      router.push('/login');
    }
  }, [userProfile, isAuthLoading, router]);

  useEffect(() => {
    if (userProfile?.uid) {
      setIsLoadingBookings(true);
      const bookingsQuery = query(collection(db, 'bookings'), where('driverId', '==', userProfile.uid));
      
      const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
        const driverBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        driverBookings.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.startTime}`);
          const dateB = new Date(`${b.date}T${b.startTime}`);
          return dateB.getTime() - dateA.getTime();
        });
        setBookings(driverBookings);
        setIsLoadingBookings(false);
      });

      return () => unsubscribe();
    }
  }, [userProfile]);

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Booking status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update the booking status. Please try again.",
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
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-96 w-full"/>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary font-headline">My Bookings</h1>
      <p className="mt-2 text-muted-foreground">View all client bookings and manage their status.</p>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All Scheduled Bookings</CardTitle>
          <CardDescription>A list of past and upcoming jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <Skeleton className="h-64 w-full" />
          ) : bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">{format(new Date(booking.date), 'MMM do, yyyy')}</div>
                      <div className="text-sm text-muted-foreground">{booking.startTime} - {booking.endTime}</div>
                    </TableCell>
                    <TableCell>{booking.clientName}</TableCell>
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell className="capitalize">{booking.vehicleVolume}</TableCell>
                    <TableCell className="text-right">
                       <Select 
                          defaultValue={booking.status} 
                          onValueChange={(newStatus: Booking['status']) => handleStatusChange(booking.id!, newStatus)}
                       >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue>
                                <Badge variant={getStatusVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-transit">In Transit</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertTitle>No Bookings Found</AlertTitle>
                <AlertDescription>
                    You do not have any bookings yet. Once a client books your service, it will appear here.
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

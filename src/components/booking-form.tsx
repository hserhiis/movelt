"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, addHours } from 'date-fns';
import { BOOKING_DURATION_HOURS } from '@/lib/time';
import { useAuth } from '@/hooks/use-auth';

import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Truck } from 'lucide-react';

const formSchema = z.object({
  vehicleVolume: z.enum(['small', 'medium', 'large'], { required_error: 'Please select a vehicle size.' }),
  name: z.string().min(2, "Please enter a contact name."),
  phone: z.string().min(10, 'Phone number must be at least 10 digits.').max(15, 'Phone number seems too long.'),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  comments: z.string().max(500, 'Comments cannot exceed 500 characters.').optional(),
});

type BookingFormValues = z.infer<typeof formSchema>;

interface BookingFormProps {
  selectedDate: Date;
  selectedTime: Date;
  driverId: string;
  onBookingSuccess: () => void;
}

export function BookingForm({ selectedDate, selectedTime, driverId, onBookingSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleVolume: undefined,
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      email: userProfile?.email || '',
      comments: '',
    },
  });
  
  // Sync form with userProfile when it loads
  form.watch(({ name, phone, email }) => {
    if (userProfile && !name && !phone && !email) {
      form.reset({
        name: userProfile.name,
        phone: userProfile.phone,
        email: userProfile.email,
        vehicleVolume: form.getValues('vehicleVolume'),
        comments: form.getValues('comments'),
      });
    }
  });


  const onSubmit = async (values: BookingFormValues) => {
    if (!userProfile) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to create a booking.",
        });
        return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        ...values,
        clientId: userProfile.uid,
        clientName: userProfile.name, // Add the client's name from their profile
        driverId: driverId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: format(selectedTime, 'HH:mm'),
        endTime: format(addHours(selectedTime, BOOKING_DURATION_HOURS), 'HH:mm'),
        createdAt: Timestamp.now(),
        status: 'pending',
      });

      toast({
        title: "Booking Confirmed!",
        description: `Your transport for ${format(selectedDate, 'MMMM do')} at ${format(selectedTime, 'p')} is scheduled.`,
      });
      
      form.reset();
      onBookingSuccess();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="sticky top-8 bg-card/80 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary"/>
            Confirm Your Booking
        </CardTitle>
        <CardDescription>
          For {format(selectedDate, 'EEEE, MMMM do')} at {format(selectedTime, 'p')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="vehicleVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Volume</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select truck size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="small">Small (e.g., Studio Apt)</SelectItem>
                      <SelectItem value="medium">Medium (e.g., 1-2 Bedroom Apt)</SelectItem>
                      <SelectItem value="large">Large (e.g., 3+ Bedroom Home)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                            <Input placeholder="Your contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Contact Email (Optional)</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="For notifications" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
           
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any special instructions?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || !userProfile}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Book Now'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

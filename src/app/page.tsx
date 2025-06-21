"use client";

import { useState, useEffect, useMemo, type FC } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Booking } from '@/lib/types';
import { getAvailableTimeSlots } from '@/lib/time';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isEqual, addMonths, subMonths } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Truck, Clock, Calendar as CalendarIcon, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookingForm } from '@/components/booking-form';
import { Skeleton } from '@/components/ui/skeleton';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] =useState<Date | null>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedDate) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, where('date', '==', format(selectedDate, 'yyyy-MM-dd')));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(fetchedBookings);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching bookings: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableTimeSlots(selectedDate, bookings);
  }, [selectedDate, bookings]);

  const handleDateSelect = (day: Date) => {
    setSelectedDate(day);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
  };
  
  const handleBookingSuccess = () => {
    setSelectedTime(null);
  }

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const startingDayIndex = getDay(firstDayOfMonth);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary font-headline">MoveIt Schedule</h1>
        <p className="text-muted-foreground mt-2">Select a date and time to book your furniture transport.</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Previous month">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-xl font-semibold text-center font-headline">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Next month">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-muted-foreground mb-4">
                {weekDays.map(day => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startingDayIndex }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))}
                {daysInMonth.map(day => (
                  <Button
                    key={day.toString()}
                    variant={isEqual(day, selectedDate || 0) ? "default" : "outline"}
                    className={cn(
                      "h-12 w-full text-lg rounded-lg transition-all duration-200 transform hover:-translate-y-1 shadow-md hover:shadow-xl",
                      isToday(day) && !isEqual(day, selectedDate || 0) && "border-primary/50 text-primary",
                      isEqual(day, selectedDate || 0) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"
                    )}
                    onClick={() => handleDateSelect(day)}
                  >
                    {format(day, 'd')}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedDate && (
            <Card className="mt-8 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Available Slots for {format(selectedDate, 'MMMM do, yyyy')}</CardTitle>
                <CardDescription>All bookings are for a 2-hour duration.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableSlots.map(slot => (
                      <Button
                        key={slot.toISOString()}
                        variant={isEqual(slot, selectedTime || 0) ? "default" : "outline"}
                        className="h-12 text-md justify-between items-center transition-all duration-200 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
                        onClick={() => handleTimeSelect(slot)}
                      >
                        {format(slot, 'p')}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No available slots for this day. Please select another date.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedDate && selectedTime ? (
            <BookingForm 
              selectedDate={selectedDate} 
              selectedTime={selectedTime}
              onBookingSuccess={handleBookingSuccess} 
            />
          ) : (
            <Card className="sticky top-8 bg-card/80 backdrop-blur-sm h-full flex flex-col items-center justify-center text-center p-8">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <CalendarIcon className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-headline">Select a date and time</CardTitle>
                  <CardDescription>
                    Your booking details will appear here once you've selected an available slot from the calendar.
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

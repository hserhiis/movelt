import { addHours, setHours, setMinutes } from 'date-fns';
import type { Booking } from './types';

export const BOOKING_DURATION_HOURS = 2;
const BUFFER_DURATION_HOURS = 1;

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 18; // Last booking can start at 16:00 to end at 18:00

// Generates all possible 1-hour interval start times for a given day
export const generateTimeSlots = (date: Date): Date[] => {
  const slots: Date[] = [];
  let current = setMinutes(setHours(date, DAY_START_HOUR), 0);
  const endOfDay = setMinutes(setHours(date, DAY_END_HOUR), 0);

  while (current < endOfDay) {
    // A booking must be able to complete within the day
    if (addHours(current, BOOKING_DURATION_HOURS) <= endOfDay) {
      slots.push(new Date(current));
    }
    current = addHours(current, 1);
  }
  return slots;
};

// Gets available slots by filtering out booked/buffered times
export const getAvailableTimeSlots = (date: Date, bookings: Booking[]): Date[] => {
  const allPossibleSlots = generateTimeSlots(date);
  
  if (!bookings || bookings.length === 0) {
    return allPossibleSlots;
  }
  
  const blockedIntervals = bookings.map(booking => {
    const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
    const bookingEnd = new Date(`${booking.date}T${booking.endTime}`);
    const bufferEnd = addHours(bookingEnd, BUFFER_DURATION_HOURS);
    return { start: bookingStart, end: bufferEnd };
  });

  return allPossibleSlots.filter(slot => {
    const slotStart = slot;
    const slotEnd = addHours(slot, BOOKING_DURATION_HOURS);

    // Check if the proposed slot [slotStart, slotEnd) overlaps with any blocked interval
    for (const interval of blockedIntervals) {
      // Overlap condition:
      // (StartA < EndB) and (EndA > StartB)
      if (slotStart < interval.end && slotEnd > interval.start) {
        return false; // This slot is not available
      }
    }
    return true; // This slot is available
  });
};

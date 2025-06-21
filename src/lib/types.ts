import type { Timestamp } from "firebase/firestore";

export interface Booking {
  id?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  vehicleVolume: 'small' | 'medium' | 'large';
  name?: string;
  phone: string;
  email?: string;
  comments?: string;
  createdAt: Timestamp;
}

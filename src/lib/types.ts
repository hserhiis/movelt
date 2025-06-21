import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  role: 'client' | 'driver';
  name: string;
  phone: string;
}

export interface Booking {
  id?: string;
  clientId: string;
  clientName: string;
  driverId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  vehicleVolume: 'small' | 'medium' | 'large';
  name?: string; // This is the contact name for the booking, could be different from client name
  phone: string;
  email?: string;
  comments?: string;
  createdAt: Timestamp;
  status: 'pending' | 'in-transit' | 'completed' | 'cancelled';
}

export interface DriverProfile {
    uid: string;
    name: string;
    logoUrl?: string;
    about: string;
    contactEmail: string;
    contactPhone: string;
}

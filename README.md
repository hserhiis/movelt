# MoveIt Schedule

This is a Next.js application for scheduling and managing furniture transportation services, built with Firebase and modern UI components.

## Features

- **Interactive Calendar**: Visually select dates for booking.
- **Real-time Time Slots**: See available time slots update in real-time. Bookings are 2 hours with a 1-hour buffer automatically handled.
- **Simple Booking Form**: Quickly book a slot by providing necessary details.
- **Firebase Integration**: All bookings are stored in Firestore, ensuring data is live and consistent across all users.

## Getting Started

First, set up your Firebase project and update the configuration in `src/lib/firebase.ts`.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

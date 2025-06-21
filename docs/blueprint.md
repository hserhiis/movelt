# **App Name**: MoveIt Schedule

## Core Features:

- Interactive Calendar: Display an interactive, 3D-style calendar for date selection.
- Time Slot Display: Show available time slots under the calendar in a vertical list with clickable arrows.
- Booking Buffer: Enforce a 1-hour buffer between bookings, preventing overlapping schedules.
- User Form: Capture vehicle volume (small, medium, large) and contact information through a form after slot selection.
- Booking Management: Store all bookings in Firebase Firestore and prevent double bookings by disabling taken slots.
- Real-time Updates: Reflect booking changes in real-time using Firebase to avoid race conditions.
- Optional Authentication: Allow optional Firebase Authentication to associate bookings with user accounts for better management.

## Style Guidelines:

- Primary color: Midnight Blue (#2C3E50) for a professional and reliable feel.
- Background color: Dark Slate Gray (#34495E), a desaturated version of Midnight Blue that's fitting for a dark color scheme.
- Accent color: Teal (#1ABC9C), an analogous hue that stands out against the dark background.
- Body and headline font: 'Inter' sans-serif for a modern, objective look.
- Adaptive layout that provides a user-friendly experience across devices, maintaining consistency.
- Subtle transitions and animations to enhance user experience, like smooth scrolling and calendar date selections.
- Use simple, line-based icons for vehicle sizes and calendar navigation to ensure clarity and consistency with the dark theme.
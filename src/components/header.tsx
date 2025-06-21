"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Truck, LogOut, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const { userProfile, isLoading } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary font-headline">
              <Truck />
              <span>MoveIt</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoading && (
              <>
                {userProfile ? (
                  <>
                    <span className='hidden sm:block text-sm text-muted-foreground'>
                      Welcome, {userProfile.name || userProfile.role}!
                    </span>
                    <Link href={userProfile.role === 'driver' ? '/driver/dashboard' : '/client/dashboard'}>
                        <Button variant="ghost" size="sm">
                            <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

import { Button } from "@/components/ui/button";
import { Package, CalendarCheck, UserCheck } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary font-headline">
                    Effortless Furniture Transport Scheduling
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    MoveIt provides a seamless platform to connect clients with reliable drivers. Book your move in minutes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="w-full min-[400px]:w-auto">Get Started</Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="secondary" className="w-full min-[400px]:w-auto">Login</Button>
                  </Link>
                </div>
              </div>
              <Image
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                data-ai-hint="moving truck"
                height="550"
                src="https://placehold.co/600x600.png"
                width="550"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">How It Works</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Three Simple Steps to Book</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our process is designed for your convenience. Get your furniture moving without the hassle.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <UserCheck className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-bold">1. Create an Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up as a client or a driver to get started. It's fast, free, and secure.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                     <div className="p-4 bg-primary/10 rounded-full">
                        <CalendarCheck className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-bold">2. Select a Slot</h3>
                <p className="text-sm text-muted-foreground">
                  Clients can view real-time availability and pick a time slot that works for them.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center mb-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Package className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-bold">3. Confirm & Move</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in your details, confirm your booking, and your driver will handle the rest.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

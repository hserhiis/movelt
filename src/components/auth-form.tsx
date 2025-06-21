"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const signupSchema = z.object({
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    role: z.enum(['client', 'driver'], { required_error: 'Please select a role.' }),
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = mode === 'login' ? loginSchema : signupSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      ...(mode === 'signup' && { role: 'client', name: '', phone: '' }),
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const signupValues = values as SignupFormValues;
        const userCredential = await createUserWithEmailAndPassword(auth, signupValues.email, signupValues.password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role: signupValues.role,
          name: signupValues.name,
          phone: signupValues.phone,
        });

        if(signupValues.role === 'driver') {
            await setDoc(doc(db, 'driverProfiles', user.uid), {
                uid: user.uid,
                name: signupValues.name,
                about: `Welcome to the page for ${signupValues.name}! You can edit this information in your dashboard.`,
                contactEmail: user.email,
                contactPhone: signupValues.phone,
                logoUrl: ""
            })
        }
        
        toast({ title: "Account created successfully!" });
        router.push(signupValues.role === 'driver' ? '/driver/dashboard' : '/client/dashboard');

      } else {
        const loginValues = values as LoginFormValues;
        const userCredential = await signInWithEmailAndPassword(auth, loginValues.email, loginValues.password);
        const user = userCredential.user;

        // Fetch user profile to determine role for redirection
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        toast({ title: "Logged in successfully!" });
        
        if (userDoc.exists()) {
          const userProfile = userDoc.data();
          if (userProfile.role === 'driver') {
            router.push('/driver/dashboard');
          } else {
            router.push('/client/dashboard');
          }
        } else {
            router.push('/'); 
        }
      }
    } catch (error: any) {
      console.error(`${mode} error:`, error);
      toast({
        variant: "destructive",
        title: `Error during ${mode}`,
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</CardTitle>
        <CardDescription>{mode === 'login' ? 'Login to manage your bookings.' : 'Sign up to start booking or driving.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             {mode === 'signup' && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {mode === 'signup' && (
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                        <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {mode === 'signup' && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I am a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="client" />
                          </FormControl>
                          <FormLabel className="font-normal">Client</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="driver" />
                          </FormControl>
                          <FormLabel className="font-normal">Driver</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === 'login' ? 'Login' : 'Sign Up'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

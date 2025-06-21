
"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { DriverProfile } from '@/lib/types';

import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  about: z.string().min(20, 'Please write a bit more about your service.').max(500, 'About section cannot exceed 500 characters.'),
  contactEmail: z.string().email('Invalid email address.'),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 digits.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function DriverProfilePage() {
  const { userProfile, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!isAuthLoading && (!userProfile || userProfile.role !== 'driver')) {
      router.push('/login');
    }
  }, [userProfile, isAuthLoading, router]);

  useEffect(() => {
    if (userProfile?.uid) {
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        const profileRef = doc(db, 'driverProfiles', userProfile.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const profileData = profileSnap.data() as DriverProfile;
          setDriverProfile(profileData);
          form.reset(profileData);
          if (profileData.logoUrl) {
            setLogoPreview(profileData.logoUrl);
          }
        }
        setIsLoadingProfile(false);
      };
      fetchProfile();
    }
  }, [userProfile, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    }
  }

  const uploadLogo = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!userProfile) {
            reject("No user profile found");
            return;
        }
        const storageRef = ref(storage, `logos/${userProfile.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                setUploadProgress(null);
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setUploadProgress(null);
                    setLogoFile(null);
                    resolve(downloadURL);
                });
            }
        );
    });
  }

  const onSubmit = async (values: ProfileFormValues) => {
    if (!userProfile) return;
    setIsSubmitting(true);
    
    try {
        let logoUrl = driverProfile?.logoUrl || '';
        if (logoFile) {
            logoUrl = await uploadLogo(logoFile);
        }

        const profileRef = doc(db, 'driverProfiles', userProfile.uid);
        await updateDoc(profileRef, {
            ...values,
            logoUrl: logoUrl,
        });

      toast({ title: "Profile Updated", description: "Your public profile has been saved." });
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingProfile || isAuthLoading || !userProfile) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-[500px] w-full"/>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-primary font-headline">Edit My Profile</h1>
      <p className="mt-2 text-muted-foreground">This information will be visible to clients on your public booking page.</p>

      <Card className="mt-8">
         <CardHeader>
            <CardTitle>My Public Information</CardTitle>
            <CardDescription>Update your logo, bio, and contact info.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Company/Driver Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., MoveIt Masters" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>About Us</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell clients about your services..." className="min-h-[150px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="contactEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Public Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="contact@moveit.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Public Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(123) 456-7890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-1 space-y-2">
                             <FormLabel>Company Logo</FormLabel>
                             <Card className="aspect-square flex items-center justify-center bg-muted/50">
                                {logoPreview ? (
                                    <Image src={logoPreview} alt="Logo preview" width={200} height={200} className="object-contain rounded-md h-full w-full" />
                                ) : (
                                    <div className="text-center text-muted-foreground p-4">
                                        <User className="h-16 w-16 mx-auto" />
                                        <p>No logo uploaded</p>
                                    </div>
                                )}
                             </Card>
                             <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/gif" onChange={handleLogoChange} className="hidden" />
                             <Button type="button" variant="outline" className="w-full" asChild>
                                <label htmlFor="logo-upload">
                                    <Upload className="mr-2 h-4 w-4" /> Change Logo
                                </label>
                             </Button>
                             {uploadProgress !== null && <Progress value={uploadProgress} className="w-full mt-2" />}
                        </div>
                   </div>
                   <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || uploadProgress !== null}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {uploadProgress !== null ? 'Uploading...' : 'Save Changes'}
                        </Button>
                   </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}

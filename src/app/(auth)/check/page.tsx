"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function CheckUserPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkAndCreateUser = async () => {
      setLoading(true);
      try {
        // First check if user exists
        const response = await axios.get(`/api/user/${user.id}`);
        
        if (response.status === 200) {
          // User exists, redirect to home
          router.push("/");
          return;
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // User doesn't exist, create new user
          try {
            await axios.post("/api/user", {
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName
            });
            
            toast.success("Account created successfully!");
            router.push("/");
          } catch (createError) {
            console.error("Error creating user:", createError);
            toast.error("Failed to create account");
            router.push("/sign-in");
          }
        } else {
          console.error("Error checking user:", error);
          toast.error("Something went wrong");
          router.push("/sign-in");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAndCreateUser();
  }, [user, isLoaded, router]);

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto max-w-md p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-6">Checking your account...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome to AeosLabs</h1>
      <p className="text-muted-foreground">
        We are verifying your account details
      </p>
    </div>
  );
}
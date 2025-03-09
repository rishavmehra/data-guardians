"use client";

import React from "react";
import { DashboardNavbar } from "@/components/layout/sections/dashboard/DashboardNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWallet } from "@solana/wallet-adapter-react";
import { Toaster } from "@/components/ui/toaster";

export default function ProfilePage() {
  const { publicKey } = useWallet();
  
  // Get wallet initials for avatar
  const getInitials = () => {
    if (!publicKey) return 'DG';
    return publicKey.toString().slice(0, 2).toUpperCase();
  };
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Avatar className="h-20 w-20 border">
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div>
                <CardTitle className="text-xl">Your Wallet</CardTitle>
                <CardDescription className="font-mono mt-2">
                  {publicKey ? publicKey.toString() : "Not connected"}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-muted-foreground">
                Your profile page is currently under development. In the future, this page will allow you to:
              </p>
              
              <ul className="list-disc ml-6 mt-3 space-y-1 text-muted-foreground">
                <li>Update your creator profile</li>
                <li>Manage your verification status</li>
                <li>View your content analytics</li>
                <li>Manage your notification preferences</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}
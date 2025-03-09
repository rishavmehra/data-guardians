"use client";

import React from "react";
import { DashboardNavbar } from "@/components/layout/sections/dashboard/DashboardNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to be notified about activities related to your content
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-attestation" className="block mb-1">Attestation Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications when your content is attested</p>
                </div>
                <Switch id="notif-attestation" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-licensing" className="block mb-1">License Activity</Label>
                  <p className="text-sm text-muted-foreground">Get updates when your content licenses are used</p>
                </div>
                <Switch id="notif-licensing" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-newsletter" className="block mb-1">Product Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive news about DataGuardians features</p>
                </div>
                <Switch id="notif-newsletter" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure your DataGuardians experience
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="setting-autoconnect" className="block mb-1">Auto-connect Wallet</Label>
                  <p className="text-sm text-muted-foreground">Automatically connect your wallet on page load</p>
                </div>
                <Switch id="setting-autoconnect" defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="setting-analytics" className="block mb-1">Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help us improve by allowing anonymous usage data collection</p>
                </div>
                <Switch id="setting-analytics" defaultChecked />
              </div>
              
              <div className="mt-8">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}
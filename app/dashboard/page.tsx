"use client";

import React from "react";
import { DashboardNavbar } from "@/components/layout/sections/dashboard/DashboardNavbar";
import EnhancedWalletConnect from "@/components/dashboard/EnhancedWalletConnect";
import ContentUpload from "@/components/dashboard/ContentUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Sparkles, BarChart, FileCheck, Key } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard navigation */}
      <DashboardNavbar />
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <EnhancedWalletConnect />
            
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Uploaded Content</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Attested Content</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Licenses Issued</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Content Management</h1>
            
            <Tabs defaultValue="upload" className="mb-8">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="attest" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Attest</span>
                </TabsTrigger>
                <TabsTrigger value="license" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">License</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                <ContentUpload />
              </TabsContent>
              
              <TabsContent value="attest">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Attestation</CardTitle>
                    <CardDescription>
                      Attest your uploaded content to create an immutable record on the blockchain
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      First upload your content, then you can attest it here to create a verifiable signature 
                      that proves you are the original creator.
                    </p>
                    {/* Attestation functionality would go here */}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="license">
                <Card>
                  <CardHeader>
                    <CardTitle>License Management</CardTitle>
                    <CardDescription>
                      Create and manage licenses for your content based on Universal Data License (UDL)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Define how others can use your content and under what terms. Create customized licenses
                      that establish clear boundaries for usage rights.
                    </p>
                    {/* Licensing functionality would go here */}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Card className="bg-muted/30 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 text-muted-foreground">
                  <p>Your recent activity will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
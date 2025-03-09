"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardNavbar } from "@/components/layout/sections/dashboard/DashboardNavbar";
import EnhancedWalletConnect from "@/components/dashboard/EnhancedWalletConnect";
import ContentUpload from "@/components/dashboard/ContentUpload";
import { ContentAttestationComponent } from "@/components/dashboard/ContentAttestationComponent";
import ContentLicenseComponent from "@/components/dashboard/ContentLicenseComponent";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Sparkles, BarChart, FileCheck, Key } from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState("upload");

  useEffect(() => {
    if (tabParam && ["upload", "attest", "license"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("upload");
    }
  }, [tabParam]);

  // hhandle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/dashboard?tab=${value}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <span className="text-sm text-muted-foreground">
                      Uploaded Content
                    </span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Attested Content
                    </span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Licenses Issued
                    </span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Content Management</h1>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
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
                <ContentAttestationComponent />
              </TabsContent>
              <TabsContent value="license">
                <ContentLicenseComponent />
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
      <Toaster />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

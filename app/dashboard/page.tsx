"use client";

import React from "react";
import { DashboardNavbar } from "@/components/layout/sections/dashboard/DashboardNavbar";
import CustomWalletButton from "@/components/layout/sections/wallet/CustomWalletButton";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* New dashboard navigation */}
      <DashboardNavbar />
      <main className="container mx-auto p-8">
        {/* Display wallet connect/disconnect button */}
        <div className="mb-4">
        </div>
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-xl">
          Welcome to the Dashboard! Here you can register, attest content,
          manage licensing, and more.
        </p>
        <CustomWalletButton/>
        {/* Add further dashboard components here */}
      </main>
    </div>
  );
}

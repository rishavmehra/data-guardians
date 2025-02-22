"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  // Hide the global navbar when the route starts with /dashboard
  const isDashboardRoute = pathname.startsWith("/dashboard");
  if (isDashboardRoute) return null;
  return <Navbar />;
}

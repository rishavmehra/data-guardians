"use client";

import { ChevronsLeftRight, Github, Menu } from "lucide-react";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,  
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ToggleTheme } from "@/components/layout/toogle-theme";

interface RouteProps {
  href: string;
  label: string;
}

const dashboardRoutes: RouteProps[] = [
  { href: "/dashboard/register", label: "Register" },
  { href: "/dashboard/attestation", label: "Content Attestation" },
  { href: "/dashboard/licensing", label: "Licensing" },
];

export const DashboardNavbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="shadow-inner bg-opacity-15 w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 bg-card">
      {/* Logo / Home Link */}
      <Link href="/dashboard" className="font-bold text-lg flex items-center">
        <span className="bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white flex justify-center items-center">
          D
        </span>
        Dashboard
      </Link>

      {/* Mobile Navigation */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
              <Menu className="cursor-pointer" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link
                    href="/dashboard"
                    className="flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="bg-gradient-to-tr from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white flex justify-center items-center">
                      D
                    </span>
                    Dashboard
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                {dashboardRoutes.map(({ href, label }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}
              </div>
            </div>
            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-2" />
              <ToggleTheme />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <NavigationMenu className="hidden lg:block mx-auto">
        <NavigationMenuList>
          {dashboardRoutes.map(({ href, label }) => (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink asChild>
                <Link href={href} className="text-base px-2">
                  {label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right-side Controls */}
      <div className="hidden lg:flex items-center gap-4">
        <ToggleTheme />
        {/* Optionally, you can add additional controls similar to the global Navbar */}
      </div>
    </header>
  );
};


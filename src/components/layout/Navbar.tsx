"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import ModeToggle from "./ModeToggle";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isHome = pathname === "/";

  const linkClass = (path: string) => `font-semibold text-lg ${pathname === path ? "text-orange-500 dark" : "text-slate-800 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-500"}`;

  return (
    <div className="fixed items-center justify-between flex w-full p-3 top-0 z-50 bg-white/10 backdrop-blur-md border-b-[1px] border-slate-300/20 h-14">
      {/* Logo */}
      <Link href="/" className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 font-macondo font-extrabold">
        ChatPDF.
      </Link>

      {/* Desktop Menu */}
      <SignedIn>
        {!isHome && (
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/tools" className={linkClass("/tools")}>
              Tools
            </Link>
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <SignInButton oauthFlow="popup" mode="modal" signUpFallbackRedirectUrl={"/dashboard"} signUpForceRedirectUrl={"/dashboard"}>
          <Button variant={"outline"} size={"sm"}>
            <Image src="/google.svg" width={12} height={12} alt="google" />
            <span className="text-xs">Login</span>
          </Button>
        </SignInButton>
      </SignedOut>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {!isHome && <ModeToggle />}

        <SignedIn>
          <UserButton />
        </SignedIn>

        {/* Mobile Menu Toggle */}
        <SignedIn>
          {!isHome && (
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </SignedIn>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-14 right-0 bg-white dark:bg-slate-900 w-full shadow-lg py-2 md:hidden">
          <Link href="/dashboard" className={`block px-4 py-2 ${pathname === "/dashboard" ? "text-orange-500" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`} onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link href="/tools" className={`block px-4 py-2 ${pathname === "/tools" ? "text-orange-500" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`} onClick={() => setIsOpen(false)}>
            Tools
          </Link>
        </div>
      )}
    </div>
  );
}

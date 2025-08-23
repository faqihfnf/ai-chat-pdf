import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <div className="fixed items-center justify-between flex w-full p-3 top-0 z-50 bg-white/10 backdrop-blur-md border-b-[1px] border-slate-300/20 h-14">
      <Link href="/" className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 font-macondo font-extrabold">
        ChatPDF.
      </Link>

      <SignedIn>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold">
            Dashboard
          </Link>
          <Link href="/tools" className="font-semibold">
            Tools
          </Link>
        </div>
      </SignedIn>

      <SignedOut>
        <SignInButton oauthFlow="popup" mode="modal" signUpFallbackRedirectUrl={"/dashboard"} signUpForceRedirectUrl={"/dashboard"}>
          <Button variant={"outline"} size={"sm"}>
            <Image src="/google.svg" width={12} height={12} alt="google" />
            <span className="text-xs">Login</span>
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

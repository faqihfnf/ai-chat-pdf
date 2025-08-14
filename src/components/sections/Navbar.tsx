import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

export default function Navbar() {
  return (
    <div className="fixed items-center justify-between flex w-full p-3 top-0 z-50 bg-white/10 backdrop-blur-md border-b-[1px] border-slate-300/20 h-14">
      <Link
        href="/"
        className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
        ChatPDF.
      </Link>

      <SignedOut>
        <SignInButton
          oauthFlow="popup"
          mode="modal"
          signUpFallbackRedirectUrl={"/dashboard"}
          signUpForceRedirectUrl={"/dashboard"}>
          <Button variant={"outline"} size={"sm"}>
            <Image src="/google.svg" width={12} height={12} alt="google" />
            <span className="text-xs">Login with Google</span>
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

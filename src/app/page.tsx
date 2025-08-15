import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import { ArrowRightIcon, Stars } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex text-center flex-col items-center justify-center w-full gap-8 mx-auto bg-gradient-to-tr from-amber-100 via-orange-100 to-rose-200">
      <Badge className="flex items-center gap-2 py-1 px-3 bg-rose-200 rounded-full mt-20">
        <Stars className="w-4 h-4 text-rose-800" />
        <span className="text-xs text-rose-800 font-medium">Powered by AI</span>
      </Badge>

      <h1 className="text-2xl md:text-4xl font-bold tracking-tight max-w-4xl">
        Talk to your PDF for deeper insights with AI Chat
      </h1>
      <p className="text-md md:text-xl text-muted-foreground max-w-2xl">
        Upload Any PDF, ask question and get answers instantly and in real-time
        with AI. It&apos;s that easy.
      </p>
      <SignedOut>
        <SignInButton
          oauthFlow="popup"
          mode="modal"
          signUpFallbackRedirectUrl={"/dashboard"}
          signUpForceRedirectUrl={"/dashboard"}>
          <Button>
            <Image src="/google.svg" width={15} height={15} alt="google" />
            Login with Google
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Link href="/dashboard">
          <Button
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:bg-gradient-to-l hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 shadow-[0_0_15px_0_var(--tw-shadow-color)] hover:shadow-[0_0_25px_0_var(--tw-shadow-color)] shadow-orange-300 hover:shadow-orange-400 transition-all duration-300 ease-in-out"
            size={"lg"}>
            Go to Dashboard <ArrowRightIcon className="w-6 h-6" />
          </Button>
        </Link>
      </SignedIn>

      <div className="mt-6 mb-6 p-0.5 bg-orange-100 rounded-2xl shadow-orange-200 shadow-[0_0_15px_0_var(--tw-shadow-color)]">
        <Image
          src="/showcase.png"
          width={800}
          height={800}
          alt="showcase"
          className="rounded-xl h-auto w-auto"
        />
      </div>
    </div>
  );
}

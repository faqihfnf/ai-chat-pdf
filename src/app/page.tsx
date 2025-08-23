"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cover } from "@/components/ui/cover";
import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import { ArrowRightIcon, FileText, MessageCircle, Stars, ToolCase, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Highlight } from "@/components/ui/hero-highlight";

export default function Home() {
  return (
    <div className="flex text-center flex-col items-center justify-center w-full gap-8 mx-auto bg-gradient-to-tr from-amber-100 via-orange-100 to-rose-200">
      <Badge className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-rose-200 to-orange-200 border border-rose-300/50 rounded-full mt-20 shadow-lg backdrop-blur-sm">
        <Stars className="w-4 h-4 text-rose-800" />
        <span className="text-xs text-rose-800 font-semibold">Powered by AI</span>
      </Badge>

      <h1 className="text-3xl md:text-6xl font-bold tracking-tight max-w-4xl text-slate-900">
        Talk to your PDF for deeper insights with{" "}
        <Cover>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">AI Chat</span>
        </Cover>
      </h1>
      <p className="text-md md:text-xl text-muted-foreground max-w-2xl">
        Upload Any <Highlight>PDF</Highlight>, ask your question and get answers <Highlight>instantly</Highlight> with AI Chat. It&apos;s that <Highlight> easy.</Highlight>
      </p>

      <div className="flex items-center justify-center gap-4">
        <SignedOut>
          <SignInButton oauthFlow="popup" mode="modal" signUpFallbackRedirectUrl={"/dashboard"} signUpForceRedirectUrl={"/dashboard"}>
            <Button size={"lg"} variant={"outline"}>
              <Image src="/google.svg" width={12} height={12} alt="google" />
              Login
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Link href="/dashboard">
            <Button variant={"primary"} className=" shadow-[0_0_15px_0_var(--tw-shadow-color)] hover:shadow-[0_0_25px_0_var(--tw-shadow-color)] shadow-orange-300 hover:shadow-orange-400 transition-all duration-300 ease-in-out" size={"lg"}>
              Dashboard <ArrowRightIcon className="w-6 h-6" />
            </Button>
          </Link>
        </SignedIn>

        <Link href="/tools">
          <Button variant={"tertiary"} size={"lg"} className="shadow-[0_0_15px_0_var(--tw-shadow-color)] hover:shadow-[0_0_25px_0_var(--tw-shadow-color)] shadow-orange-300 hover:shadow-orange-400 p-4">
            PDF Tools
            <ToolCase className="ml-1 w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Feature highlights */}
      <div className="flex flex-wrap justify-center gap-6 max-w-2xl">
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-200/50 shadow-sm shadow-orange-300 hover:shadow-md transition-all duration-300 hover:scale-105">
          <FileText className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-gray-700">Any PDF Format</span>
        </div>
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-200/50 shadow-sm shadow-rose-300 hover:shadow-md transition-all duration-300 hover:scale-105">
          <Zap className="w-4 h-4 text-rose-600" />
          <span className="text-sm font-medium text-gray-700">Instant Answers</span>
        </div>
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-200/50 shadow-sm shadow-amber-300 hover:shadow-md transition-all duration-300 hover:scale-105">
          <MessageCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-gray-700">Real-time Chat</span>
        </div>
      </div>

      {/* Hero image */}
      <motion.div className="mt-8 mb-12 px-2 sm:px-4">
        <motion.div className="relative group" whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-orange-300 via-rose-300 to-amber-300 rounded-2xl blur opacity-75 group-hover:opacity-100"
            animate={{
              scale: [1, 1.02, 1],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative p-1 bg-gradient-to-r from-orange-100 via-rose-100 to-amber-100 rounded-2xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.5 }}>
                <Image src="/showcase.jpg" width={900} height={600} alt="ChatPDF Showcase" className="rounded-lg h-auto w-auto shadow-2xl" priority />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

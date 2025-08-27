"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cover } from "@/components/ui/cover";
import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import { BotMessageSquare, FileText, LayoutDashboard, MessageCircle, Stars, SwatchBook, ToolCase, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Highlight } from "@/components/ui/hero-highlight";

export default function Home() {
  return (
    <div className="flex text-center flex-col bg-gradient-to-tr from-amber-100 via-orange-100 to-rose-200">
      <div className="flex text-center flex-col items-center justify-center w-full gap-8 mx-auto px-4 mb-10 mt-5">
        <Badge className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-rose-200 to-orange-200 border border-rose-300/50 rounded-full mt-20 shadow-lg backdrop-blur-sm">
          <Stars className="w-4 h-4 text-rose-800" />
          <span className="text-xs text-rose-800 font-semibold">Powered by AI</span>
        </Badge>

        <h1 className="text-2xl sm:text-3xl md:text-6xl font-bold tracking-tight max-w-4xl text-indigo-950 leading-none md:leading-[80px] font-righteous">
          Complete PDF Platform for <br />
          <Cover>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">Chat</span>
          </Cover>{" "}
          and{" "}
          <Cover>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500">Tools</span>
          </Cover>
        </h1>
        <p className="text-md md:text-xl text-muted-foreground max-w-4xl">
          <Highlight>Chat</Highlight> with AI for deeper insights from your PDF plus a collection of powerful PDF <Highlight>Tools</Highlight>.
        </p>

        <div className="flex items-center justify-center gap-4 px-4 flex-col sm:flex-row">
          <SignedOut>
            <SignInButton oauthFlow="popup" mode="modal" signUpFallbackRedirectUrl={"/dashboard"} signUpForceRedirectUrl={"/dashboard"}>
              <Button
                variant={"primary"}
                className=" shadow-[0_0_15px_0_var(--tw-shadow-color)] hover:shadow-[0_0_25px_0_var(--tw-shadow-color)] shadow-orange-300 hover:shadow-orange-400 transition-all duration-300 ease-in-out text-lg w-48"
                size={"xl"}
              >
                <BotMessageSquare className="size-5" />
                Start Chat
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button
                variant={"primary"}
                className=" shadow-[0_0_15px_0_var(--tw-shadow-color)] hover:shadow-[0_0_25px_0_var(--tw-shadow-color)] shadow-orange-300 hover:shadow-orange-400 transition-all duration-300 ease-in-out text-lg w-48"
                size={"xl"}
              >
                <LayoutDashboard className="size-5" /> Dashboard
              </Button>
            </Link>
          </SignedIn>

          <Link href="/tools">
            <Button variant={"tertiary"} size={"xl"} className="shadow-[0_0_15px_0_var(--tw-shadow-color)] hover:shadow-[0_0_25px_0_var(--tw-shadow-color)] shadow-cyan-300 hover:shadow-cyan-400 p-4 text-lg w-48">
              PDF Tools
              <ToolCase className="size-5" />
            </Button>
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
          <div className="flex items-center gap-1 sm:gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 sm:px-3 sm:py-2 border border-orange-200/50 shadow-sm shadow-orange-300 hover:shadow-md transition-all duration-300 hover:scale-105">
            <FileText className="size-3 sm:size-4 text-orange-600" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Any PDF Format</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 sm:px-3 sm:py-2 border border-orange-200/50 shadow-sm shadow-rose-300 hover:shadow-md transition-all duration-300 hover:scale-105">
            <Zap className="size-3 sm:size-4 text-rose-600" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Instant Answers</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 sm:px-3 sm:py-2 border border-orange-200/50 shadow-sm shadow-amber-300 hover:shadow-md transition-all duration-300 hover:scale-105">
            <MessageCircle className="size-3 sm:size-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Real-time Chat</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 sm:px-3 sm:py-2 border border-orange-200/50 shadow-sm shadow-indigo-300 hover:shadow-md transition-all duration-300 hover:scale-105">
            <ToolCase className="size-3 sm:size-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Powerful Tools</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 bg-white/60 backdrop-blur-sm rounded-full p-1 sm:px-3 sm:py-2 border border-orange-200/50 shadow-sm shadow-lime-300 hover:shadow-md transition-all duration-300 hover:scale-105">
            <SwatchBook className="size-3 sm:size-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">User Friendly</span>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="flex flex-col">
        {/* Image 1 - Description on the right */}
        <div className="flex flex-col lg:flex-row items-center justify-start gap-8 lg:gap-12">
          {/* Image */}
          <motion.div className="mt-8 mb-12 px-2 sm:px-4 order-2 lg:order-1 lg:w-3/5" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
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
                    <Image src="/showcase.jpg" width={900} height={600} alt="ChatPDF Showcase" className="rounded-lg h-auto w-full shadow-2xl" priority />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Description on the right (desktop) / above (mobile) */}
          <motion.div className="px-4 sm:px-6 lg:px-8 order-1 lg:order-2 lg:w-2/5" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">Fitur Chat PDF yang Canggih</h3>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-4">
              Berinteraksi langsung dengan dokumen PDF Anda menggunakan teknologi AI terdepan. Ajukan pertanyaan dan dapatkan jawaban yang akurat dari konten dokumen Anda.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mr-3"></span>
                Upload PDF dengan mudah
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mr-3"></span>
                Chat real-time dengan dokumen
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mr-3"></span>
                Jawaban yang akurat dan kontekstual
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Image 2 - Description on the left */}
        <div className="flex flex-col lg:flex-row-reverse items-center justify-end gap-8 lg:gap-12">
          {/* Image */}
          <motion.div className="mt-8 mb-12 px-2 sm:px-4 order-2 lg:order-1 lg:w-3/5" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
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
                    <Image src="/tools.jpg" width={900} height={600} alt="ChatPDF Tools" className="rounded-lg h-auto w-full shadow-2xl" priority />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Description on the left (desktop) / above (mobile) */}
          <motion.div className="px-4 sm:px-6 lg:px-8 order-1 lg:order-2 lg:w-2/5" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">Tools dan Analisis Mendalam</h3>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-4">Manfaatkan berbagai tools canggih untuk menganalisis dokumen PDF Anda secara mendalam. Ekstrak informasi penting dan dapatkan insights yang valuable.</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mr-3"></span>
                Ekstraksi teks otomatis
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mr-3"></span>
                Analisis konten mendalam
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mr-3"></span>
                Ringkasan dokumen otomatis
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

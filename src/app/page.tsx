"use client";
import HeroSection from "@/components/sections/landing-page/HeroSection";
import HeroImage from "@/components/sections/landing-page/HeroImage";

export default function Home() {
  return (
    <div className="flex text-center flex-col bg-gradient-to-tr from-amber-100 via-orange-100 to-rose-200">
      {/* Hero section */}
      <HeroSection />

      {/* Hero image */}
      <HeroImage />
    </div>
  );
}

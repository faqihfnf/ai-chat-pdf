"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { BicepsFlexed, Brain, FileText, MessageCircle, Shapes, SwatchBook, Zap } from "lucide-react";

export default function HeroImage() {
  return (
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

          {/* Badge Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex justify-center items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-1 py-2 border-orange-200/50 shadow-sm shadow-orange-300 hover:shadow-md transition-all duration-300 hover:scale-105">
              <Brain className="size-3 text-orange-600" />
              <span className="text-xs font-medium text-slate-700">Smart</span>
            </div>
            <div className="flex justify-center items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-1 py-2 border-rose-200/50 shadow-sm shadow-rose-300 hover:shadow-md transition-all duration-300 hover:scale-105">
              <Zap className="size-3 text-rose-600" />
              <span className="text-xs font-medium text-slate-700">Instant</span>
            </div>
            <div className="flex justify-center items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-1 py-2 border-amber-200/50 shadow-sm shadow-amber-300 hover:shadow-md transition-all duration-300 hover:scale-105">
              <MessageCircle className="size-3 text-amber-600" />
              <span className="text-xs font-medium text-slate-700">Realtime</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image 2 - Description on the left */}
      <div className="flex flex-col lg:flex-row-reverse items-center justify-end gap-8 lg:gap-12">
        {/* Image */}
        <motion.div className="mt-8 mb-12 px-2 sm:px-4 order-2 lg:order-1 lg:w-3/5" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <motion.div className="relative group" whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
            <motion.div
              className="absolute -inset-1 bg-gradient-to-l from-sky-300 via-cyan-300 to-emerald-300 rounded-2xl blur opacity-75 group-hover:opacity-100"
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
            <div className="relative p-1 bg-gradient-to-r from-sky-100 via-cyan-100 to-emerald-100 rounded-2xl">
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

          {/* Badge Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex justify-center items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-1 py-2 border-sky-200/50 shadow-sm shadow-sky-300 hover:shadow-md transition-all duration-300 hover:scale-105">
              <SwatchBook className="size-3 text-sky-600" />
              <span className="text-xs font-medium text-slate-700">Simple</span>
            </div>
            <div className="flex justify-center items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-1 py-2 border-cyan-200/50 shadow-sm shadow-cyan-300 hover:shadow-md transition-all duration-300 hover:scale-105">
              <BicepsFlexed className="size-3 text-cyan-600" />
              <span className="text-xs font-medium text-slate-700">Powerfull</span>
            </div>
            <div className="flex justify-center items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-1 py-2 border-emerald-200/50 shadow-sm shadow-emerald-300 hover:shadow-md transition-all duration-300 hover:scale-105">
              <Shapes className="size-3 text-emerald-600" />
              <span className="text-xs font-medium text-slate-700">Equipped</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

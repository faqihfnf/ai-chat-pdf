import type { Metadata } from "next";
import { Inter, Macondo, Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import QueryProvider from "@/components/layout/query-provider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const macondo = Macondo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-macondo",
});

export const metadata: Metadata = {
  title: "AI Chat PDF",
  description: "AI Chat PDF Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <html lang="en" className={macondo.variable}>
          <body className={` ${poppins.className} ${inter.className}  antialiased`}>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Toaster />
            <Footer />
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}

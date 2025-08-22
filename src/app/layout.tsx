import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
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
        <html lang="en">
          <body className={` ${poppins.className} ${inter.className}  antialiased`}>
            <Navbar />
            <main className="">{children}</main>
            <Toaster />
            <Footer />
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}

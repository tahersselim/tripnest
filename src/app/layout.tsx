import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { ToastContainer } from "react-toastify";
import 'react-toastify/ReactToastify.css'
import QuiryProvider from "@/components/QuiryProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "TripNest",
  description: "Plan your next trip effortlessly with TripNest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QuiryProvider>
            <div>
              <Navbar />
              {children}
              <Footer />
              <ToastContainer position="bottom-right" theme="dark" autoClose={4000} />
            </div>
          </QuiryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}



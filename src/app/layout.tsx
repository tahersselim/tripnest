import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { ToastContainer } from "react-toastify";
import 'react-toastify/ReactToastify.css'
import QuiryProvider from "@/components/QuiryProvider";



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



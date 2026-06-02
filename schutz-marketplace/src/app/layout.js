import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ThemeToggle from "../components/layout/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>

        <Navbar />

        <div className="center-theme">
          <ThemeToggle />
        </div>

        {children}

        <Footer />

      </body>
    </html>
  );
}
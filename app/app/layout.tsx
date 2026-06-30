import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "react-hot-toast"
import Navbar from "@/components/Navbar"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PeerRent — Borrow Anything, From Anyone",
  description:
    "Peer-to-peer rental marketplace powered by Casper Network. Rent cameras, bikes, tools, and more from people near you.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#030712] text-white">
        <Navbar />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(5, 8, 22, 0.95)",
              backdropFilter: "blur(20px)",
              color: "#f9fafb",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            },
          }}
        />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import { Archivo, Archivo_Black, IBM_Plex_Mono } from "next/font/google"
import { Toaster } from "react-hot-toast"
import Navbar from "@/components/Navbar"
import "./globals.css"

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
})

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
})

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600", "700"],
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
      className={`${archivo.variable} ${archivoBlack.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#faf8f1",
              color: "#1c1a13",
              border: "1px solid #1c1a13",
              borderRadius: "0",
              boxShadow: "4px 4px 0 rgba(28, 26, 19, 0.15)",
              fontFamily: "var(--font-plex-mono), monospace",
              fontSize: "13px",
            },
          }}
        />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}

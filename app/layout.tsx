import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono, Dancing_Script } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"
import { SocketProvider } from "@/contexts/SocketContext"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

const dancingScript = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Lovesathi - Dating & Matrimony",
  description: "Modern dating app for serious relationships and matrimony",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable} ${dancingScript.variable} antialiased dark`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SocketProvider>
            {children}
            <Toaster /> {/* ✅ Sonner toaster here */}
            <ShadcnToaster /> {/* ✅ Shadcn toaster for form validations */}
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

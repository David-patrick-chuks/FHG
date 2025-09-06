import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import { DM_Sans, JetBrains_Mono } from "next/font/google"
import type React from "react"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const dmSansHeading = DM_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["600", "700"],
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MailQuill - AI-Powered Email Marketing Platform",
  description:
    "Create, automate, and optimize email campaigns with AI technology that delivers results. Transform your email marketing with intelligent automation.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSansHeading.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
         <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            {children}
            <Toaster />
            <Analytics/>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

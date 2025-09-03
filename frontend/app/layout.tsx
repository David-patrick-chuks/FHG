import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"

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
  title: "FHG AI Email Bot - Intelligent Email Marketing Automation",
  description:
    "Create powerful AI-driven email campaigns that convert. Automated outreach, personalized messaging, and advanced analytics for modern email marketing teams.",
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

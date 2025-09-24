import { ConditionalAnalytics } from "@/components/analytics/ConditionalAnalytics"
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner"
import { CookieInitializer } from "@/components/cookies/CookieInitializer"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { UnreadCountProvider } from "@/contexts/UnreadCountContext"
import { OrganizationJsonLd, WebsiteJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/JsonLd"
import { ConditionalSupportBot } from "@/components/support/ConditionalSupportBot"
import { generateMetadata as generateSEOMetadata, seoConfigs } from "@/lib/seo"
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

export const metadata: Metadata = generateSEOMetadata(seoConfigs.home)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <SoftwareApplicationJsonLd />
      </head>
      <body className={`${dmSansHeading.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
         <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <UnreadCountProvider>
              <CookieInitializer />
              <Navbar />
              {children}
              <CookieConsentBanner />
              <Toaster />
              <ConditionalAnalytics />
              <ConditionalSupportBot />
            </UnreadCountProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

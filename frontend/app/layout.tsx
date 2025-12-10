import { ConditionalAnalytics } from "@/components/analytics/ConditionalAnalytics"
import { CookieConsentBanner } from "@/components/cookies/CookieConsentBanner"
import { CookieInitializer } from "@/components/cookies/CookieInitializer"
import { Navbar } from "@/components/navbar"
import { OrganizationJsonLd, SoftwareApplicationJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { UnreadCountProvider } from "@/contexts/UnreadCountContext"
import { generateMetadata as generateSEOMetadata, seoConfigs, viewport } from "@/lib/seo"
import type { Metadata } from "next"
import { DM_Sans, JetBrains_Mono } from "next/font/google"
import type React from "react"
import "./globals.css"

import Script from "next/script"

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
export { viewport }

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
               {/* <Script
         src="https://preview--feedbot-platform.lumi.ing/widget.js" data-agent-id="6938094b2a05c171332d82d2"
          strategy="afterInteractive"
        /> */}
       <Script
    src="https://985010e5-977e-4f75-8201-d4a4a0133ae4.canvases.tempo.build/widget.js" data-agent-id="3b3a50a8-2379-4e3a-a882-73900fb36a36"
          strategy="afterInteractive"
        />
               {/* <Script
          src="https://nocode-ai-platform.lumi.ing/embed.js"
          data-agent-id="6925a4bcf0c10874d159ef91"
          strategy="afterInteractive"
        /> */}
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
            </UnreadCountProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

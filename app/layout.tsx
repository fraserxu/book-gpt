import { CredentialsCookieProvider } from "@/context/credentials-context"
import { Inter as FontSans } from "@next/font/google"

import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-white font-sans text-slate-900 antialiased",
          fontSans.variable
        )}
      >
        <CredentialsCookieProvider>
          <SiteHeader />
          <main>{children}</main>
        </CredentialsCookieProvider>
        <Toaster />
      </body>
    </html>
  )
}

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  viewport: "width=device-width, initial-scale=1",
}

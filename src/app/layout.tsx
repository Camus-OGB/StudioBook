import type { Metadata, Viewport } from 'next'
import { Sora, Outfit } from 'next/font/google'
import './globals.css'
import SiteHeader from '@/components/layout/SiteHeader'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IMA Studio – Sème City',
  description:
    "Plateforme de gestion des inscriptions et réservations de l'IMA Studio, studio multimédia de Sème City (Cotonou, Bénin).",
}

export const viewport: Viewport = {
  themeColor: '#4527A0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${sora.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col font-sans text-ima-ink">
        <SiteHeader />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  )
}

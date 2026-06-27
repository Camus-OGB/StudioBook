import type { Metadata, Viewport } from 'next'
import './globals.css'
import SiteHeader from '@/components/layout/SiteHeader'

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
    <html lang="fr">
      <head>
        {/* Polices chargées côté navigateur (pas de dépendance Google au build). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans text-ima-ink">
        <SiteHeader />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  )
}

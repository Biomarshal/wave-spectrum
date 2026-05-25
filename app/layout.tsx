import type { Metadata, Viewport } from 'next'
import './globals.css'
import PlayerProvider from '@/components/player/PlayerProvider'

export const metadata: Metadata = {
  title: 'Wave Spectrum — Music Streaming',
  description: 'Your personal music streaming experience. Discover, play, and immerse yourself in sound.',
  keywords: ['music', 'streaming', 'wave spectrum', 'audio', 'player'],
  authors: [{ name: 'Wave Spectrum' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#080a10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import AuthProvider from '@/components/auth/AuthProvider'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased theme-transition bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <PlayerProvider />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}



import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Orbitron, Rajdhani } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-rajdhani',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'DATAPI — Neural Token Mining Protocol',
  description:
    'Mine DPI tokens from the datastream every 24 hours. Overclock your rig with boost modules and climb the global hashrate leaderboard.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0f1a',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${orbitron.variable} ${rajdhani.variable}`}>
      <body className="antialiased overflow-x-hidden">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

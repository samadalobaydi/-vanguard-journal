import type { Metadata } from 'next'
import { Bebas_Neue, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vanguard — Discipline Journal',
  description: 'The daily discipline system for men who refuse to be ordinary.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-base font-sans antialiased">{children}</body>
    </html>
  )
}

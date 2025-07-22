import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'TinySeed Portfolio - Discover Innovative SaaS Companies',
    template: '%s | TinySeed Portfolio'
  },
  description: 'Explore TinySeed\'s portfolio of innovative SaaS companies. Use AI-powered search to discover companies by technology, industry, business model, and more. See how these founder-controlled businesses are building the future.',
  keywords: [
    'TinySeed',
    'SaaS companies',
    'startup accelerator',
    'portfolio companies',
    'founder-controlled',
    'bootstrap',
    'AI search',
    'semantic search',
    'startup directory'
  ],
  authors: [{ name: 'TinySeed' }],
  creator: 'TinySeed',
  publisher: 'TinySeed',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://portfolio.tinyseed.com',
    siteName: 'TinySeed Portfolio',
    title: 'TinySeed Portfolio - Discover Innovative SaaS Companies',
    description: 'Explore TinySeed\'s portfolio of innovative SaaS companies. Use AI-powered search to discover companies by technology, industry, business model, and more.',
    images: [
      {
        url: '/tinyseed-og-image.png',
        width: 1200,
        height: 630,
        alt: 'TinySeed Portfolio - Discover Innovative SaaS Companies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinySeed Portfolio - Discover Innovative SaaS Companies',
    description: 'Explore TinySeed\'s portfolio of innovative SaaS companies. Use AI-powered search to discover companies by technology, industry, and business model.',
    creator: '@tinyseed',
    site: '@tinyseed',
    images: {
      url: '/tinyseed-og-image.png',
      alt: 'TinySeed Portfolio',
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://portfolio.tinyseed.com',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/seed-favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/seed-favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-white">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
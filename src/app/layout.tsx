import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';

import { Curtain } from '@/components/chrome/curtain';
import { Cursor } from '@/components/chrome/cursor';
import { ScrollProgress } from '@/components/chrome/scroll-progress';
import { MotionProvider } from '@/components/motion/motion-provider';
import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';
import { bootScript } from '@/lib/boot-script';
import './globals.css';

// Self-hosted at build time by next/font: no runtime font CDN.
const display = Cormorant_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: true,
});

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: {
    default: 'Hair By Naplin — Beauty in motion · Kumasi',
    template: '%s · Hair By Naplin',
  },
  description:
    'Hair By Naplin, Kumasi: luxury hair bundles, ready-to-wear frontal and closure wigs, salon styling and practical training in wig work, extensions, braiding and hairstyling.',
  // A cinematic concept edition with generated imagery: keep it out of search
  // until the owner approves it as a public site (see README).
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0a090b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en-GH"
      className={`no-js ${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <MotionProvider>
          <Curtain />
          <ScrollProgress />
          <Header />
          {children}
          <Footer />
          <Cursor />
        </MotionProvider>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}

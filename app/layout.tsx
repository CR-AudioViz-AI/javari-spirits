// app/layout.tsx — javari-spirits
//
// ONE header, ONE footer. This file used to render its own fixed bar and
// app/page.tsx rendered a second nav directly beneath it, so the site said
// "Javari Spirits" twice before you reached any content. Both are components
// now, so every page gets the same shell and there is one place to change it.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
import type { Metadata } from 'next'
import SiteHeader from '@/components/brand/SiteHeader'
import SiteFooter from '@/components/brand/SiteFooter'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  // 2026-08-16: the icons and share card existed in public/ but nothing pointed
  // at them, so every share rendered as a blank grey rectangle and every tab
  // showed a default globe.
  icons: {
    icon: [{ url: '/favicon.png', sizes: '32x32' }, { url: '/icon-512.png', sizes: '512x512' }],
    apple: '/apple-touch-icon.png',
  },
  // 2026-08-16: no metadataBase meant relative og:image paths resolved against
  // the preview hostname, and no canonical meant a trailing slash, a query
  // string and a preview host all competed for the same content.
  metadataBase: new URL('https://javarispirits.com'),
  alternates: { canonical: '/' },
  title: 'Javari Spirits — track every bottle you own',
  description:
    'Your whiskey, wine and spirits collection on one shelf. Scan a barcode, track what is sealed and what is open, and know what it is worth.',
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  openGraph: {
    title: 'Javari Spirits — track every bottle you own',
    description: 'Your whiskey, wine and spirits collection on one shelf.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0, padding: 0, background: '#0D0E11', color: '#F2EDE4',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex', flexDirection: 'column', minHeight: '100vh',
        }}
      >
        {/* 2026-09-10: WCAG 2.4.1. Without this a keyboard user traverses the
            entire navigation on every page before reaching anything. Visually
            hidden until focused, which is the point - it is for people who are
            not using a mouse, and it appears the moment they tab. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline focus:outline-2"
        >
          Skip to main content
        </a>

        <SiteHeader />
        <main style={{ flex: 1 }}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}

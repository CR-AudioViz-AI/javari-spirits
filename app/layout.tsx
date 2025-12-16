import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JavariWidget from '@/components/JavariWidget';
import { PlatformCrossSell } from '@/components/PlatformCrossSell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRAVBarrels - Premium Spirit Collection & Discovery | 22,000+ Spirits',
  description: 'Build your dream spirit collection with CRAVBarrels. Discover 22,000+ spirits, track prices, scan barcodes, and connect with collectors worldwide. Free AI sommelier included.',
  keywords: ['whiskey', 'bourbon', 'scotch', 'spirits', 'collection', 'rare bottles', 'tequila', 'rum', 'cognac', 'spirit scanner', 'whiskey collection', 'bourbon collection'],
  authors: [{ name: 'CR AudioViz AI' }],
  openGraph: {
    title: 'CRAVBarrels - Premium Spirit Collection & Discovery',
    description: 'Discover 22,000+ spirits. AI-powered recommendations. Barcode scanning. Collection tracking.',
    type: 'website',
    locale: 'en_US',
    siteName: 'CRAVBarrels',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRAVBarrels - 22,000+ Spirits',
    description: 'Your premium spirit collection companion. Discover, scan, collect.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#78350f" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col bg-stone-950">
            <Navbar />
            <main className="flex-1">{children}</main>
            
            {/* Platform Cross-Sell Banner */}
            <PlatformCrossSell />
            
            <Footer />
          </div>
          
          {/* Javari AI Assistant */}
          <JavariWidget 
            pageContext="cravbarrels"
            userTier="free"
          />
          
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRAVBarrels - Premium Spirit Collection & Discovery',
  description: 'Build your dream spirit collection with CRAVBarrels. Discover rare bottles, track prices, connect with collectors, and explore 22,000+ spirits worldwide.',
  keywords: ['whiskey', 'bourbon', 'scotch', 'spirits', 'collection', 'rare bottles', 'tequila', 'rum', 'cognac'],
  authors: [{ name: 'CR AudioViz AI' }],
  openGraph: {
    title: 'CRAVBarrels - Premium Spirit Collection & Discovery',
    description: 'Build your dream spirit collection. Discover rare bottles, track prices, and connect with collectors.',
    type: 'website',
    locale: 'en_US',
    siteName: 'CRAVBarrels',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRAVBarrels',
    description: 'Premium Spirit Collection & Discovery Platform',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

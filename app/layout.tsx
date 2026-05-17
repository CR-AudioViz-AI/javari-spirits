// app/layout.tsx — Javari Spirits
// Fortune 50 quality — uses AppShell for full ecosystem integration
// May 17, 2026 — CR AudioViz AI, LLC
import type { Metadata } from 'next'
import './globals.css'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Javari Spirits | Javari by CR AudioViz AI',
  description: 'Premium spirits collection tracker with AI',
  keywords: 'Javari Spirits, Javari, AI, CR AudioViz AI',
}

import AppShell from '@/components/AppShell'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <AppShell
          appName="Javari Spirits"
          appColor="#f59e0b"
          appEmoji="🥃"
          appDesc="Premium spirits collection tracker with AI"
      handoffApp="Javari Cards"
      handoffUrl="https://javaricards.com"
      handoffPitch="Also collect trading cards? Track them here →"
        >
          {children}
        </AppShell>
      </body>
    </html>
  )
}

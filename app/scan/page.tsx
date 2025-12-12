// app/scan/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BarcodeScanner from '@/components/BarcodeScanner';
import { Wine, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const router = useRouter();
  const [scannedSpirit, setScannedSpirit] = useState<any>(null);

  const handleScanComplete = (spirit: any) => {
    setScannedSpirit(spirit);
    // Optionally redirect to the spirit's page
    // router.push(`/spirits/${spirit.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-amber-400">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wine className="w-6 h-6 text-amber-500" />
            Bottle Scanner
          </h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Scanner */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <BarcodeScanner 
              onScanComplete={handleScanComplete}
              onClose={() => router.back()}
            />
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center text-gray-400">
            <h2 className="text-lg font-semibold text-white mb-4">How to Scan</h2>
            <ol className="space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
                <span>Point your camera at the barcode on the bottle</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">2</span>
                <span>Hold steady until the barcode is detected</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-amber-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">3</span>
                <span>Review the details and add to your collection</span>
              </li>
            </ol>
          </div>

          {/* Recently Scanned */}
          {scannedSpirit && (
            <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="text-green-400 font-semibold mb-2">Just Added!</h3>
              <p className="text-white">{scannedSpirit.name}</p>
              <p className="text-gray-400 text-sm">{scannedSpirit.brand} • {scannedSpirit.category}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

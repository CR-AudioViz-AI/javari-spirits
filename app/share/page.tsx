'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// SHARE TARGET PAGE
// ============================================

function ShareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(true);

  const title = searchParams.get('title') || '';
  const text = searchParams.get('text') || '';
  const url = searchParams.get('url') || '';

  useEffect(() => {
    // Process the shared content
    const processShare = async () => {
      // Check if it's a spirit URL or barcode
      if (url.includes('spirits/') || url.includes('barcode=')) {
        // Extract spirit ID and redirect
        const spiritId = url.match(/spirits\/([^/]+)/)?.[1];
        if (spiritId) {
          router.push(`/spirits/${spiritId}`);
          return;
        }
      }

      // Check if it's a bottle barcode
      const barcodeMatch = text.match(/\b\d{8,14}\b/);
      if (barcodeMatch) {
        router.push(`/scan?barcode=${barcodeMatch[0]}`);
        return;
      }

      // If it looks like a spirit name, search for it
      if (title || text) {
        const searchTerm = title || text;
        router.push(`/explore?q=${encodeURIComponent(searchTerm)}`);
        return;
      }

      setProcessing(false);
    };

    processShare();
  }, [title, text, url, router]);

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🥃</div>
          <p className="text-white text-lg">Processing shared content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📥</div>
          <h1 className="text-2xl font-bold text-white mb-2">Content Received</h1>
          <p className="text-gray-400">What would you like to do with this?</p>
        </div>

        {/* Shared Content Preview */}
        <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
          {title && (
            <div className="mb-2">
              <span className="text-gray-500 text-sm">Title:</span>
              <p className="text-white font-medium">{title}</p>
            </div>
          )}
          {text && (
            <div className="mb-2">
              <span className="text-gray-500 text-sm">Text:</span>
              <p className="text-gray-300 text-sm">{text}</p>
            </div>
          )}
          {url && (
            <div>
              <span className="text-gray-500 text-sm">URL:</span>
              <p className="text-amber-500 text-sm truncate">{url}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={`/explore?q=${encodeURIComponent(title || text)}`}
            className="block w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white text-center rounded-xl font-medium transition-colors"
          >
            🔍 Search Spirits
          </Link>
          
          <Link
            href="/scan"
            className="block w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white text-center rounded-xl font-medium transition-colors"
          >
            📷 Scan Bottle
          </Link>
          
          <Link
            href="/cocktails/genius"
            className="block w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white text-center rounded-xl font-medium transition-colors"
          >
            🍸 Find Cocktails
          </Link>
          
          <Link
            href="/"
            className="block w-full px-6 py-3 text-gray-400 text-center rounded-xl font-medium hover:text-white transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🥃</div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}

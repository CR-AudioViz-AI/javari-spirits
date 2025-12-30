'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">📴</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          You're Offline
        </h1>
        <p className="text-gray-400 mb-8">
          It looks like you've lost your internet connection. 
          Some features may be unavailable until you reconnect.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-500 transition-colors"
          >
            Try Again
          </button>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-bold text-white mb-4">Available Offline:</h2>
            <ul className="text-left space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>View cached spirits</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Play trivia (cached questions)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>View your collection</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">✗</span>
                <span>Search new spirits</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">✗</span>
                <span>Post reviews</span>
              </li>
            </ul>
          </div>
          
          <Link 
            href="/games"
            className="block w-full px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            🎮 Play Offline Games
          </Link>
        </div>
        
        <p className="text-gray-600 text-sm mt-8">
          Your changes will sync automatically when you're back online.
        </p>
      </div>
    </div>
  );
}

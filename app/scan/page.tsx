'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ============================================
// TYPES
// ============================================

interface ScanResult {
  spirit?: {
    id: string;
    name: string;
    brand: string;
    category: string;
    image_url?: string;
    abv?: number;
    description?: string;
    community_rating?: number;
  };
  barcode?: string;
  confidence: number;
  source: 'barcode' | 'image' | 'manual';
}

// ============================================
// BARCODE SCANNER PAGE
// ============================================

export default function BarcodeScannerPage() {
  const [mode, setMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [manualInput, setManualInput] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ============================================
  // CAMERA SETUP
  // ============================================

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      streamRef.current = stream;
      setCameraPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraPermission('denied');
      setError('Camera access denied. Please enable camera permissions or try uploading an image.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  // ============================================
  // CAPTURE & ANALYZE
  // ============================================

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanning(true);
    setError(null);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);
      
      // Get image data
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to API for analysis
      const response = await fetch('/api/scan/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          type: 'camera',
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.spirit) {
        setResult({
          spirit: data.spirit,
          barcode: data.barcode,
          confidence: data.confidence || 0.85,
          source: data.barcode ? 'barcode' : 'image',
        });
      } else {
        setError(data.error || 'Could not identify this bottle. Try again or search manually.');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  // ============================================
  // FILE UPLOAD
  // ============================================

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setScanning(true);
    setError(null);
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;
        
        const response = await fetch('/api/scan/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageData,
            type: 'upload',
          }),
        });
        
        const data = await response.json();
        
        if (data.success && data.spirit) {
          setResult({
            spirit: data.spirit,
            barcode: data.barcode,
            confidence: data.confidence || 0.80,
            source: data.barcode ? 'barcode' : 'image',
          });
        } else {
          setError(data.error || 'Could not identify this bottle. Try a clearer image.');
        }
        
        setScanning(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process image. Please try again.');
      setScanning(false);
    }
  };

  // ============================================
  // MANUAL SEARCH
  // ============================================

  const handleManualSearch = async () => {
    if (!manualInput.trim()) return;
    
    setScanning(true);
    setError(null);
    
    try {
      // Check if it's a barcode (numeric)
      const isBarcode = /^\d{8,14}$/.test(manualInput.trim());
      
      const params = new URLSearchParams();
      if (isBarcode) {
        params.append('barcode', manualInput.trim());
      } else {
        params.append('query', manualInput.trim());
      }
      
      const response = await fetch(`/api/scan/search?${params}`);
      const data = await response.json();
      
      if (data.success && data.spirit) {
        setResult({
          spirit: data.spirit,
          barcode: isBarcode ? manualInput.trim() : undefined,
          confidence: 1.0,
          source: 'manual',
        });
      } else {
        setError('Spirit not found. Try a different search term.');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  // ============================================
  // RESET
  // ============================================

  const resetScan = () => {
    setResult(null);
    setError(null);
    setManualInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="text-2xl">🥃</span>
            <span className="font-bold">CravBarrels</span>
          </Link>
          <h1 className="text-white font-semibold">Bottle Scanner</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {result ? (
            // Result View
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Match Card */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-2 text-green-400 mb-4">
                  <span className="text-2xl">✓</span>
                  <span className="font-medium">
                    {result.confidence > 0.9 ? 'Perfect Match!' : 
                     result.confidence > 0.7 ? 'Good Match' : 'Possible Match'}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({Math.round(result.confidence * 100)}% confidence)
                  </span>
                </div>

                <div className="flex gap-6">
                  {result.spirit?.image_url && (
                    <div className="w-32 h-48 bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={result.spirit.image_url}
                        alt={result.spirit.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {result.spirit?.name}
                    </h2>
                    <p className="text-amber-500 font-medium mb-2">
                      {result.spirit?.brand}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <span className="px-2 py-1 bg-gray-700 rounded">
                        {result.spirit?.category}
                      </span>
                      {result.spirit?.abv && (
                        <span>{result.spirit.abv}% ABV</span>
                      )}
                      {result.spirit?.community_rating && (
                        <span className="flex items-center gap-1">
                          ⭐ {result.spirit.community_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {result.spirit?.description && (
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {result.spirit.description}
                      </p>
                    )}
                  </div>
                </div>

                {result.barcode && (
                  <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-500">
                    Barcode: {result.barcode}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/spirits/${result.spirit?.id}`}
                  className="flex-1 px-6 py-4 bg-amber-600 text-white text-center font-bold rounded-xl hover:bg-amber-700 transition-colors"
                >
                  View Full Details →
                </Link>
                <button
                  onClick={resetScan}
                  className="flex-1 px-6 py-4 bg-gray-700 text-white text-center font-bold rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Scan Another Bottle
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button className="p-4 bg-gray-800 rounded-xl text-center hover:bg-gray-700 transition-colors">
                  <span className="text-2xl block mb-2">📚</span>
                  <span className="text-sm text-gray-400">Add to Collection</span>
                </button>
                <button className="p-4 bg-gray-800 rounded-xl text-center hover:bg-gray-700 transition-colors">
                  <span className="text-2xl block mb-2">✏️</span>
                  <span className="text-sm text-gray-400">Write Review</span>
                </button>
                <button className="p-4 bg-gray-800 rounded-xl text-center hover:bg-gray-700 transition-colors">
                  <span className="text-2xl block mb-2">🍸</span>
                  <span className="text-sm text-gray-400">Find Cocktails</span>
                </button>
                <button className="p-4 bg-gray-800 rounded-xl text-center hover:bg-gray-700 transition-colors">
                  <span className="text-2xl block mb-2">🛒</span>
                  <span className="text-sm text-gray-400">Where to Buy</span>
                </button>
              </div>
            </motion.div>
          ) : (
            // Scanner View
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Mode Tabs */}
              <div className="flex bg-gray-800 rounded-xl p-1">
                {[
                  { id: 'camera', label: '📷 Camera', icon: '📷' },
                  { id: 'upload', label: '📤 Upload', icon: '📤' },
                  { id: 'manual', label: '⌨️ Manual', icon: '⌨️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMode(tab.id as any)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      mode === tab.id
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scanner Area */}
              <div className="relative aspect-[4/3] bg-gray-800 rounded-2xl overflow-hidden">
                {mode === 'camera' && (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-amber-500 rounded-2xl relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-xl" />
                        
                        {scanning && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    {cameraPermission === 'denied' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                        <div className="text-center p-6">
                          <div className="text-4xl mb-4">📵</div>
                          <p className="text-white mb-4">Camera access denied</p>
                          <button
                            onClick={() => setMode('upload')}
                            className="px-6 py-2 bg-amber-600 text-white rounded-lg"
                          >
                            Upload Image Instead
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {mode === 'upload' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <label className="cursor-pointer text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="p-8 border-2 border-dashed border-gray-600 rounded-2xl hover:border-amber-500 transition-colors">
                        <div className="text-5xl mb-4">📤</div>
                        <p className="text-white font-medium mb-2">
                          {scanning ? 'Analyzing...' : 'Tap to upload a photo'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          JPG, PNG, or HEIC
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {mode === 'manual' && (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-4">
                      <div className="text-center mb-6">
                        <div className="text-5xl mb-4">🔍</div>
                        <p className="text-white font-medium">
                          Enter a barcode number or spirit name
                        </p>
                      </div>
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="e.g., 080432400098 or Buffalo Trace"
                        className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-lg"
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                      />
                      <button
                        onClick={handleManualSearch}
                        disabled={!manualInput.trim() || scanning}
                        className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-all"
                      >
                        {scanning ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden canvas for image capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-center"
                >
                  <p className="text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Capture Button (Camera Mode) */}
              {mode === 'camera' && cameraPermission === 'granted' && (
                <button
                  onClick={captureAndAnalyze}
                  disabled={scanning}
                  className="w-full py-4 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {scanning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📸</span>
                      Capture & Identify
                    </>
                  )}
                </button>
              )}

              {/* Tips */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">📌 Scanning Tips</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Hold the bottle steady in good lighting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Point at the barcode for instant results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Or capture the full label for AI identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Works with whiskey, bourbon, scotch, vodka, gin, rum, and more!</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

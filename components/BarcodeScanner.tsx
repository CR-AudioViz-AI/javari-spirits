// components/BarcodeScanner.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Check, Loader2, Wine, Search, Plus } from 'lucide-react';

interface ScanResult {
  found: boolean;
  source: string;
  spirit?: any;
  barcode?: string;
  message?: string;
}

interface BarcodeScannerProps {
  onScanComplete?: (spirit: any) => void;
  onClose?: () => void;
}

export default function BarcodeScanner({ onScanComplete, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setCameraError(null);
      }
    } catch (error) {
      setCameraError('Unable to access camera. Please grant permission or enter barcode manually.');
      console.error('Camera error:', error);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Lookup barcode
  const lookupBarcode = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/barcode?code=${encodeURIComponent(code)}`);
      const data = await response.json();
      setScanResult(data);
      
      if (data.found && data.spirit) {
        // Auto-add to database if from external source
        if (data.source !== 'database') {
          await addToDatabase(data.spirit);
        }
      }
    } catch (error) {
      setScanResult({
        found: false,
        source: 'error',
        message: 'Failed to lookup barcode'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add spirit to database
  const addToDatabase = async (spirit: any) => {
    try {
      const response = await fetch('/api/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spirit)
      });
      const data = await response.json();
      if (data.success && onScanComplete) {
        onScanComplete(data.spirit);
      }
    } catch (error) {
      console.error('Failed to add spirit:', error);
    }
  };

  // Handle manual barcode entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      stopCamera();
      lookupBarcode(manualBarcode.trim());
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Start camera on mount
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  // Capture frame and detect barcode (using BarcodeDetector API if available)
  useEffect(() => {
    if (!isScanning || !videoRef.current) return;

    let animationId: number;
    
    const detectBarcode = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      // Check if BarcodeDetector is available (Chrome, Edge)
      if ('BarcodeDetector' in window) {
        try {
          // @ts-ignore - BarcodeDetector is not in TypeScript types yet
          const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
          const barcodes = await detector.detect(videoRef.current);
          
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            stopCamera();
            lookupBarcode(code);
            return;
          }
        } catch (error) {
          console.error('Barcode detection error:', error);
        }
      }
      
      animationId = requestAnimationFrame(detectBarcode);
    };

    detectBarcode();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isScanning, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Scan Bottle Barcode
        </h2>
        <button 
          onClick={() => { stopCamera(); onClose?.(); }}
          className="text-white p-2 hover:bg-white/10 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        {!scanResult && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-32 border-2 border-amber-500 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-500 rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-500 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-500 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-500 rounded-br" />
                
                {/* Scanning line animation */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-0.5 bg-amber-500 animate-scan" />
                )}
              </div>
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
              </div>
            )}
          </>
        )}

        {/* Camera error */}
        {cameraError && !scanResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <Camera className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-white mb-4">{cameraError}</p>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black p-6 overflow-y-auto">
            {scanResult.found && scanResult.spirit ? (
              <div className="max-w-md mx-auto">
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-green-400 font-semibold">Found!</p>
                    <p className="text-green-300 text-sm">Source: {scanResult.source}</p>
                  </div>
                </div>

                {scanResult.spirit.image_url && (
                  <img 
                    src={scanResult.spirit.image_url} 
                    alt={scanResult.spirit.name}
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                  />
                )}

                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <h3 className="text-xl font-bold text-white">{scanResult.spirit.name}</h3>
                  <p className="text-amber-400">{scanResult.spirit.brand}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-700 rounded p-2">
                      <span className="text-gray-400">Category</span>
                      <p className="text-white capitalize">{scanResult.spirit.category}</p>
                    </div>
                    <div className="bg-gray-700 rounded p-2">
                      <span className="text-gray-400">Country</span>
                      <p className="text-white">{scanResult.spirit.country}</p>
                    </div>
                    {scanResult.spirit.abv && (
                      <div className="bg-gray-700 rounded p-2">
                        <span className="text-gray-400">ABV</span>
                        <p className="text-white">{scanResult.spirit.abv}%</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setScanResult(null);
                      startCamera();
                    }}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600"
                  >
                    Scan Another
                  </button>
                  <button
                    onClick={() => {
                      onScanComplete?.(scanResult.spirit);
                      onClose?.();
                    }}
                    className="flex-1 bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-500"
                  >
                    Add to Collection
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center">
                <Wine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Not Found</h3>
                <p className="text-gray-400 mb-6">{scanResult.message || 'This product is not in our database yet.'}</p>
                
                <button
                  onClick={() => setShowManualEntry(true)}
                  className="bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-500 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Add Manually
                </button>

                <button
                  onClick={() => {
                    setScanResult(null);
                    startCamera();
                  }}
                  className="mt-4 text-gray-400 hover:text-white"
                >
                  Try Another Scan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Entry Bar */}
      {!scanResult && (
        <div className="p-4 bg-black/50">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter barcode manually..."
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* CSS for scan animation */}
      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

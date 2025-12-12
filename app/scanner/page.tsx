'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { BrowserMultiFormatReader } from '@zxing/library'

interface ScanResult {
  type: 'barcode' | 'label' | 'manual'
  value: string
  spirit?: Spirit
  product?: any
  confidence?: number
  source?: string
}

interface Spirit {
  id: string
  name: string
  brand: string
  category: string
  subcategory?: string
  image_url?: string
  abv?: number
  msrp?: number
  country?: string
  description?: string
}

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [scanMode, setScanMode] = useState<'barcode' | 'label'>('barcode')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [recentScans, setRecentScans] = useState<ScanResult[]>([])
  
  // Form state for adding new spirit
  const [newSpirit, setNewSpirit] = useState({
    name: '',
    brand: '',
    category: 'bourbon',
    subcategory: '',
    abv: 40,
    msrp: 30,
    country: 'USA',
    description: '',
    barcode: ''
  })

  const codeReader = useRef<BrowserMultiFormatReader | null>(null)

  // Initialize barcode reader
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader()
    return () => {
      codeReader.current?.reset()
    }
  }, [])

  // Start camera for barcode scanning
  const startBarcodeScanning = useCallback(async () => {
    if (!codeReader.current || !videoRef.current) return
    
    setError(null)
    setLoading(true)
    
    try {
      await codeReader.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (result, error) => {
          if (result) {
            const barcode = result.getText()
            console.log('Barcode detected:', barcode)
            
            // Stop scanning
            codeReader.current?.reset()
            setCameraActive(false)
            setIsScanning(false)
            
            // Look up barcode
            await lookupBarcode(barcode)
          }
        }
      )
      setCameraActive(true)
      setIsScanning(true)
    } catch (err: any) {
      setError(err.message || 'Camera access denied')
    }
    
    setLoading(false)
  }, [])

  // Lookup barcode via API
  const lookupBarcode = async (barcode: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/barcode/lookup?barcode=${barcode}`)
      const data = await res.json()
      
      if (data.found && data.spirit) {
        // Found in our database
        setResult({
          type: 'barcode',
          value: barcode,
          spirit: data.spirit,
          source: 'BarrelVerse Database'
        })
      } else if (data.found && data.product) {
        // Found via external API
        setResult({
          type: 'barcode',
          value: barcode,
          product: data.product,
          source: data.source
        })
        // Pre-fill add form
        setNewSpirit(prev => ({
          ...prev,
          name: data.product.name || '',
          brand: data.product.brand || '',
          description: data.product.description || '',
          barcode
        }))
        setShowAddForm(true)
      } else {
        // Not found anywhere
        setResult({
          type: 'barcode',
          value: barcode,
          source: 'Not Found'
        })
        setNewSpirit(prev => ({ ...prev, barcode }))
        setShowAddForm(true)
      }
      
      // Add to recent scans
      setRecentScans(prev => [{ type: 'barcode', value: barcode, ...data }, ...prev.slice(0, 9)])
      
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  // Capture image for label scanning
  const captureForLabelScan = async () => {
    if (!videoRef.current) return
    
    setLoading(true)
    setError(null)
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    try {
      const res = await fetch('/api/scanner/label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      })
      
      const data = await res.json()
      
      if (data.extracted) {
        setNewSpirit(prev => ({
          ...prev,
          name: data.extracted.name || '',
          brand: data.extracted.brand || '',
          category: data.extracted.category || 'other',
          subcategory: data.extracted.subcategory || '',
          abv: data.extracted.abv || 40,
          country: data.extracted.country || 'Unknown',
          description: data.extracted.description || ''
        }))
        
        if (data.matches?.length > 0) {
          setResult({
            type: 'label',
            value: 'Label Scan',
            spirit: data.matches[0],
            source: 'AI Label Recognition'
          })
        } else {
          setShowAddForm(true)
        }
      }
    } catch (err: any) {
      setError(err.message)
    }
    
    setLoading(false)
  }

  // Submit new spirit
  const handleAddSpirit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/barcode/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpirit)
      })
      
      const data = await res.json()
      
      if (data.success) {
        setResult({
          type: 'manual',
          value: 'Added',
          spirit: data.spirit,
          source: 'Your Contribution'
        })
        setShowAddForm(false)
        // Reset form
        setNewSpirit({
          name: '', brand: '', category: 'bourbon', subcategory: '',
          abv: 40, msrp: 30, country: 'USA', description: '', barcode: ''
        })
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const stopCamera = () => {
    codeReader.current?.reset()
    setCameraActive(false)
    setIsScanning(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-stone-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🔍 Spirit Scanner</h1>
          <p className="text-amber-200/70">Scan barcodes or labels to identify spirits</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-stone-800/50 rounded-lg p-1">
          <button
            onClick={() => setScanMode('barcode')}
            className={`flex-1 py-3 rounded-md transition ${
              scanMode === 'barcode' ? 'bg-amber-600 text-white' : 'text-amber-200/70 hover:bg-stone-700'
            }`}
          >
            📊 Barcode
          </button>
          <button
            onClick={() => setScanMode('label')}
            className={`flex-1 py-3 rounded-md transition ${
              scanMode === 'label' ? 'bg-amber-600 text-white' : 'text-amber-200/70 hover:bg-stone-700'
            }`}
          >
            🏷️ Label (AI)
          </button>
        </div>

        {/* Camera View */}
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] mb-6">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Scan overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-amber-400 rounded-lg animate-pulse">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
              </div>
              {scanMode === 'barcode' && (
                <div className="absolute bottom-4 text-center text-amber-200 animate-pulse">
                  Position barcode in frame...
                </div>
              )}
            </div>
          )}

          {!cameraActive && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/80">
              <div className="text-6xl mb-4">{scanMode === 'barcode' ? '📊' : '📷'}</div>
              <p className="text-amber-200/70">Camera inactive</p>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900/80">
              <div className="animate-spin text-4xl">⏳</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6">
          {!cameraActive ? (
            <button
              onClick={startBarcodeScanning}
              disabled={loading}
              className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold transition disabled:opacity-50"
            >
              🎥 Start Camera
            </button>
          ) : (
            <>
              {scanMode === 'label' && (
                <button
                  onClick={captureForLabelScan}
                  disabled={loading}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition"
                >
                  📸 Capture Label
                </button>
              )}
              <button
                onClick={stopCamera}
                className="flex-1 py-4 bg-stone-700 hover:bg-stone-600 rounded-xl font-semibold transition"
              >
                ⏹️ Stop
              </button>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl mb-6 text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Result Display */}
        {result && result.spirit && (
          <div className="p-6 bg-stone-800/50 rounded-xl mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">🥃</div>
              <div>
                <h3 className="text-xl font-bold">{result.spirit.name}</h3>
                <p className="text-amber-200/70">{result.spirit.brand}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-amber-200/50">Category:</span> {result.spirit.category}</div>
              <div><span className="text-amber-200/50">ABV:</span> {result.spirit.abv}%</div>
              <div><span className="text-amber-200/50">MSRP:</span> ${result.spirit.msrp}</div>
              <div><span className="text-amber-200/50">Source:</span> {result.source}</div>
            </div>
            <Link 
              href={`/spirits/${result.spirit.id}`}
              className="mt-4 block text-center py-3 bg-amber-600 hover:bg-amber-500 rounded-lg transition"
            >
              View Full Details →
            </Link>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="p-6 bg-stone-800/50 rounded-xl mb-6">
            <h3 className="text-xl font-bold mb-4">🆕 Add New Spirit</h3>
            <p className="text-amber-200/70 text-sm mb-4">
              Help grow our database! Fill in the details below.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-amber-200/70 mb-1">Name *</label>
                <input
                  type="text"
                  value={newSpirit.name}
                  onChange={(e) => setNewSpirit(p => ({ ...p, name: e.target.value }))}
                  className="w-full p-3 bg-stone-700 rounded-lg border border-stone-600 focus:border-amber-500 outline-none"
                  placeholder="e.g., Buffalo Trace Bourbon"
                />
              </div>
              
              <div>
                <label className="block text-sm text-amber-200/70 mb-1">Brand *</label>
                <input
                  type="text"
                  value={newSpirit.brand}
                  onChange={(e) => setNewSpirit(p => ({ ...p, brand: e.target.value }))}
                  className="w-full p-3 bg-stone-700 rounded-lg border border-stone-600 focus:border-amber-500 outline-none"
                  placeholder="e.g., Buffalo Trace"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-200/70 mb-1">Category *</label>
                  <select
                    value={newSpirit.category}
                    onChange={(e) => setNewSpirit(p => ({ ...p, category: e.target.value }))}
                    className="w-full p-3 bg-stone-700 rounded-lg border border-stone-600 focus:border-amber-500 outline-none"
                  >
                    <option value="bourbon">Bourbon</option>
                    <option value="scotch">Scotch</option>
                    <option value="rye">Rye</option>
                    <option value="irish">Irish</option>
                    <option value="vodka">Vodka</option>
                    <option value="gin">Gin</option>
                    <option value="rum">Rum</option>
                    <option value="tequila">Tequila</option>
                    <option value="mezcal">Mezcal</option>
                    <option value="brandy">Brandy</option>
                    <option value="cognac">Cognac</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-amber-200/70 mb-1">ABV %</label>
                  <input
                    type="number"
                    value={newSpirit.abv}
                    onChange={(e) => setNewSpirit(p => ({ ...p, abv: Number(e.target.value) }))}
                    className="w-full p-3 bg-stone-700 rounded-lg border border-stone-600 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-amber-200/70 mb-1">MSRP $</label>
                  <input
                    type="number"
                    value={newSpirit.msrp}
                    onChange={(e) => setNewSpirit(p => ({ ...p, msrp: Number(e.target.value) }))}
                    className="w-full p-3 bg-stone-700 rounded-lg border border-stone-600 focus:border-amber-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-amber-200/70 mb-1">Country</label>
                  <input
                    type="text"
                    value={newSpirit.country}
                    onChange={(e) => setNewSpirit(p => ({ ...p, country: e.target.value }))}
                    className="w-full p-3 bg-stone-700 rounded-lg border border-stone-600 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              
              <button
                onClick={handleAddSpirit}
                disabled={loading || !newSpirit.name || !newSpirit.brand}
                className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-semibold transition disabled:opacity-50"
              >
                ✨ Add Spirit & Earn 10 Points
              </button>
            </div>
          </div>
        )}

        {/* Manual Entry */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 bg-stone-800 hover:bg-stone-700 rounded-xl font-semibold transition border border-stone-700"
        >
          ✏️ Add Spirit Manually
        </button>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
            <div className="space-y-2">
              {recentScans.map((scan, i) => (
                <div key={i} className="p-3 bg-stone-800/30 rounded-lg flex justify-between items-center">
                  <span className="font-mono text-sm">{scan.value}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    scan.spirit ? 'bg-green-600' : 'bg-amber-600'
                  }`}>
                    {scan.spirit ? 'Found' : 'New'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

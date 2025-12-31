// app/submit/page.tsx
// Spirit Submission Page for Javari Spirits

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  'Whiskey', 'Bourbon', 'Scotch', 'Rye', 'Irish Whiskey', 'Japanese Whisky',
  'Vodka', 'Gin', 'Rum', 'Tequila', 'Mezcal',
  'Cognac', 'Brandy', 'Armagnac',
  'Liqueur', 'Aperitif', 'Bitters', 'Absinthe',
  'Sake', 'Soju', 'Baijiu', 'Other'
];

const COUNTRIES = [
  'USA', 'Scotland', 'Ireland', 'Japan', 'Canada',
  'Mexico', 'France', 'England', 'Germany', 'Poland',
  'Russia', 'Caribbean', 'Australia', 'Taiwan', 'India', 'Other'
];

export default function SubmitSpiritPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    subcategory: '',
    abv: '',
    origin_country: '',
    region: '',
    distillery: '',
    age_statement: '',
    description: '',
    tasting_nose: '',
    tasting_palate: '',
    tasting_finish: '',
    barcode: '',
    msrp: '',
  });
  
  const [photos, setPhotos] = useState<{ file: File; preview: string; type: string }[]>([]);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, photoType: string) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { file, preview, type: photoType }]);
    }
  };
  
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowSuccess(true);
  };
  
  // Calculate XP reward preview
  const calculateXPReward = () => {
    let xp = 10; // Base XP
    if (formData.brand) xp += 2;
    if (formData.abv) xp += 2;
    if (formData.origin_country) xp += 2;
    if (formData.description.length > 50) xp += 5;
    if (formData.tasting_nose || formData.tasting_palate || formData.tasting_finish) xp += 10;
    if (formData.barcode) xp += 5;
    xp += photos.length * 15; // 15 XP per photo
    return xp;
  };
  
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-950/10 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-2">Spirit Submitted!</h1>
          <p className="text-gray-400 mb-6">Your contribution is pending community verification.</p>
          
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 mb-6">
            <div className="text-4xl font-bold text-green-400 mb-2">+{calculateXPReward()} XP</div>
            <p className="text-gray-400">Earned for this submission</p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setShowSuccess(false);
                setStep(1);
                setFormData({
                  name: '', brand: '', category: '', subcategory: '', abv: '',
                  origin_country: '', region: '', distillery: '', age_statement: '',
                  description: '', tasting_nose: '', tasting_palate: '', tasting_finish: '',
                  barcode: '', msrp: '',
                });
                setPhotos([]);
              }}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
            >
              + Add Another Spirit
            </button>
            <Link href="/challenges" className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg">
              View Challenges
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-950/10 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/30 border-b border-amber-700/30">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/challenges" className="text-amber-400 hover:text-amber-300 text-sm mb-2 inline-block">
            ← Back to Challenges
          </Link>
          <h1 className="text-2xl font-bold text-white">Add a Spirit</h1>
          <p className="text-amber-200/70">Help grow our database and earn XP!</p>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {['Basic Info', 'Details', 'Photos', 'Review'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-amber-500 text-white' :
                'bg-gray-700 text-gray-400'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`ml-2 text-sm ${step === i + 1 ? 'text-white' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < 3 && <div className="w-12 md:w-24 h-0.5 bg-gray-700 mx-2" />}
            </div>
          ))}
        </div>
        
        {/* XP Preview */}
        <div className="mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg flex justify-between items-center">
          <span className="text-amber-200">Estimated XP Reward:</span>
          <span className="text-2xl font-bold text-amber-400">+{calculateXPReward()} XP</span>
        </div>
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Spirit Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Buffalo Trace Kentucky Straight Bourbon"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Brand *</label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="e.g., Buffalo Trace"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ABV %</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.abv}
                  onChange={e => setFormData(prev => ({ ...prev, abv: e.target.value }))}
                  placeholder="e.g., 45"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country of Origin</label>
                <select
                  value={formData.origin_country}
                  onChange={e => setFormData(prev => ({ ...prev, origin_country: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Barcode (UPC)</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={e => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Scan or enter barcode"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.category}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              Continue to Details →
            </button>
          </div>
        )}
        
        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Distillery</label>
                <input
                  type="text"
                  value={formData.distillery}
                  onChange={e => setFormData(prev => ({ ...prev, distillery: e.target.value }))}
                  placeholder="e.g., Buffalo Trace Distillery"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age Statement</label>
                <input
                  type="text"
                  value={formData.age_statement}
                  onChange={e => setFormData(prev => ({ ...prev, age_statement: e.target.value }))}
                  placeholder="e.g., 10 Years, NAS"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this spirit..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">+5 XP for descriptions over 50 characters</p>
            </div>
            
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h3 className="font-medium text-white mb-4">Tasting Notes (Optional - +10 XP)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nose</label>
                  <input
                    type="text"
                    value={formData.tasting_nose}
                    onChange={e => setFormData(prev => ({ ...prev, tasting_nose: e.target.value }))}
                    placeholder="e.g., caramel, vanilla, oak..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Palate</label>
                  <input
                    type="text"
                    value={formData.tasting_palate}
                    onChange={e => setFormData(prev => ({ ...prev, tasting_palate: e.target.value }))}
                    placeholder="e.g., smooth, spicy, fruity..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Finish</label>
                  <input
                    type="text"
                    value={formData.tasting_finish}
                    onChange={e => setFormData(prev => ({ ...prev, tasting_finish: e.target.value }))}
                    placeholder="e.g., long, warming, oaky..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
              >
                Add Photos →
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              <p className="text-amber-200 text-sm">
                📸 Each photo earns <span className="font-bold">+15 XP</span>! Add multiple photos to maximize your reward.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {['Front Label', 'Back Label', 'Full Bottle', 'Box/Packaging'].map(photoType => (
                <div key={photoType} className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handlePhotoUpload(e, photoType)}
                    className="hidden"
                    id={`photo-${photoType}`}
                  />
                  <label
                    htmlFor={`photo-${photoType}`}
                    className="block p-6 border-2 border-dashed border-gray-600 hover:border-amber-500 rounded-lg text-center cursor-pointer transition-colors"
                  >
                    <div className="text-3xl mb-2">📷</div>
                    <div className="text-white font-medium">{photoType}</div>
                    <div className="text-xs text-gray-400">Click to upload</div>
                  </label>
                </div>
              ))}
            </div>
            
            {/* Uploaded Photos Preview */}
            {photos.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-3">Uploaded Photos ({photos.length})</h3>
                <div className="grid grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.preview}
                        alt={photo.type}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-xs text-white p-1 rounded-b-lg">
                        {photo.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
              >
                Review Submission →
              </button>
            </div>
          </div>
        )}
        
        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">{formData.name || 'Unnamed Spirit'}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Brand:</span> <span className="text-white">{formData.brand || '-'}</span></div>
                <div><span className="text-gray-400">Category:</span> <span className="text-white">{formData.category || '-'}</span></div>
                <div><span className="text-gray-400">ABV:</span> <span className="text-white">{formData.abv ? `${formData.abv}%` : '-'}</span></div>
                <div><span className="text-gray-400">Country:</span> <span className="text-white">{formData.origin_country || '-'}</span></div>
                <div><span className="text-gray-400">Distillery:</span> <span className="text-white">{formData.distillery || '-'}</span></div>
                <div><span className="text-gray-400">Age:</span> <span className="text-white">{formData.age_statement || '-'}</span></div>
              </div>
              
              {formData.description && (
                <div className="mt-4">
                  <span className="text-gray-400 text-sm">Description:</span>
                  <p className="text-white mt-1">{formData.description}</p>
                </div>
              )}
              
              {(formData.tasting_nose || formData.tasting_palate || formData.tasting_finish) && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded">
                  <span className="text-gray-400 text-sm">Tasting Notes:</span>
                  {formData.tasting_nose && <p className="text-white text-sm"><strong>Nose:</strong> {formData.tasting_nose}</p>}
                  {formData.tasting_palate && <p className="text-white text-sm"><strong>Palate:</strong> {formData.tasting_palate}</p>}
                  {formData.tasting_finish && <p className="text-white text-sm"><strong>Finish:</strong> {formData.tasting_finish}</p>}
                </div>
              )}
              
              {photos.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-400 text-sm">Photos ({photos.length}):</span>
                  <div className="flex gap-2 mt-2">
                    {photos.map((photo, i) => (
                      <img key={i} src={photo.preview} alt="" className="w-16 h-16 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">+{calculateXPReward()} XP</div>
              <p className="text-gray-400">You will earn this XP upon verification</p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold rounded-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  '✓ Submit Spirit'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

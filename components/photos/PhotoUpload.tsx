'use client';

// ============================================================
// BARRELVERSE - PHOTO UPLOAD COMPONENT
// Full-featured photo upload with legal terms, preview, and status
// Created: December 21, 2025
// ============================================================

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Check, AlertCircle, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  spiritId: string;
  spiritName: string;
  onUploadComplete?: (photo: UploadedPhoto) => void;
  onClose?: () => void;
}

interface UploadedPhoto {
  id: string;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  quality_score: number;
}

interface UploadResponse {
  success: boolean;
  photo?: UploadedPhoto;
  evaluation?: {
    quality_score: number;
    is_product_match: boolean;
    recommendation: string;
  };
  message?: string;
  error?: string;
}

const PHOTO_TERMS = `
BARRELVERSE PHOTO SUBMISSION TERMS

By submitting a photo, you agree to the following:

1. LICENSE GRANT
You grant CR AudioViz AI, LLC a perpetual, non-exclusive, royalty-free, worldwide license to use, display, reproduce, modify, and distribute your submitted photo for any platform purposes.

2. OWNERSHIP & RIGHTS
You represent that you own or have the legal right to submit this photo and it does not infringe on any third-party rights.

3. PHOTO REQUIREMENTS
Photos must be authentic images of actual alcohol products with visible labels. No inappropriate content.

4. NO COMPENSATION
No payment or credits will be provided for submitted photos.

5. MODERATION
CR AudioViz AI, LLC may accept, reject, or remove any photo at its discretion.

By clicking "Submit", you confirm you have read and agree to these terms.
`.trim();

export function PhotoUpload({ spiritId, spiritName, onUploadComplete, onClose }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select a JPEG, PNG, or WebP image');
      return;
    }
    
    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setUploadResult(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);
  
  const handleUpload = async () => {
    if (!file || !termsAccepted) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('spiritId', spiritId);
      formData.append('termsAccepted', 'true');
      
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      const result: UploadResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Upload failed');
      }
      
      setUploadResult(result);
      
      if (result.success && result.photo && onUploadComplete) {
        onUploadComplete(result.photo);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setUploadResult(null);
    setError(null);
  };
  
  // Render upload result
  if (uploadResult?.success) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-auto">
        <div className="text-center">
          {uploadResult.photo?.status === 'approved' ? (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Photo Approved!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your photo has been automatically approved and is now visible to the community.
              </p>
            </>
          ) : uploadResult.photo?.status === 'rejected' ? (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Photo Not Accepted
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {uploadResult.message}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Photo Submitted
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your photo is pending review. We'll notify you when it's approved.
              </p>
            </>
          )}
          
          {uploadResult.evaluation && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quality Score</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      uploadResult.evaluation.quality_score >= 70 
                        ? 'bg-green-500' 
                        : uploadResult.evaluation.quality_score >= 50 
                        ? 'bg-amber-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${uploadResult.evaluation.quality_score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {uploadResult.evaluation.quality_score}/100
                </span>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Upload Another
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Upload Photo
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Share your photo of <span className="font-medium">{spiritName}</span>
      </p>
      
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragActive 
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }
        `}
      >
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 mx-auto rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetForm();
              }}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Camera className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Drag & drop your photo here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              or click to browse • JPEG, PNG, WebP up to 10MB
            </p>
          </>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {/* Photo Tips */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1">
          <ImageIcon className="w-4 h-4" />
          Tips for great photos
        </h4>
        <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
          <li>• Use natural lighting</li>
          <li>• Make sure the label is clearly visible</li>
          <li>• Center the bottle in the frame</li>
          <li>• Use a plain background</li>
        </ul>
      </div>
      
      {/* Terms Checkbox */}
      <div className="mt-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            I accept the{' '}
            <button
              type="button"
              onClick={() => setShowTerms(!showTerms)}
              className="text-amber-600 hover:text-amber-700 underline"
            >
              photo submission terms
            </button>
          </span>
        </label>
      </div>
      
      {/* Terms Modal */}
      {showTerms && (
        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg max-h-48 overflow-y-auto">
          <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-sans">
            {PHOTO_TERMS}
          </pre>
        </div>
      )}
      
      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || !termsAccepted || uploading}
        className={`
          w-full mt-4 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all
          ${file && termsAccepted && !uploading
            ? 'bg-amber-600 text-white hover:bg-amber-700'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Submit Photo
          </>
        )}
      </button>
    </div>
  );
}

export default PhotoUpload;

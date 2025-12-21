// ============================================================
// BARRELVERSE - USER PHOTO UPLOAD API
// Handles user-submitted photos with legal disclaimers,
// AI quality evaluation, and moderation workflow
// Created: December 21, 2025
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

function getAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// ============================================================
// LEGAL TERMS - PHOTO UPLOAD
// ============================================================
export const PHOTO_UPLOAD_TERMS = {
  version: '1.0',
  effectiveDate: '2025-12-21',
  terms: `
BARRELVERSE PHOTO SUBMISSION TERMS

By submitting a photo to BarrelVerse (operated by CR AudioViz AI, LLC), you agree to the following terms:

1. LICENSE GRANT
You grant CR AudioViz AI, LLC a perpetual, non-exclusive, royalty-free, worldwide license to:
- Use, display, reproduce, modify, and distribute your submitted photo
- Create derivative works from your photo
- Use the photo for any platform purposes including marketing, product displays, and promotional materials
- Sub-license these rights to partners and affiliates

2. OWNERSHIP & RIGHTS
- You represent and warrant that you own or have the legal right to submit this photo
- You confirm the photo does not infringe on any third-party intellectual property rights
- You confirm you have obtained necessary permissions from any identifiable individuals in the photo
- The original copyright of the photo remains with you

3. PHOTO REQUIREMENTS
- Photos must be authentic images of actual alcohol products
- Product labels must be clearly visible
- Photos must not contain illegal, harmful, offensive, or inappropriate content
- Photos must not include nudity, violence, or hate speech
- Photos depicting consumption by minors are strictly prohibited

4. QUALITY STANDARDS
- Photos should be clear, well-lit, and in focus
- Minimum resolution: 500x500 pixels
- Accepted formats: JPEG, PNG, WebP
- Maximum file size: 10MB

5. NO COMPENSATION
- You understand that no payment, credits, or other compensation will be provided for submitted photos
- Your contribution is voluntary and for the benefit of the community

6. MODERATION RIGHTS
- CR AudioViz AI, LLC reserves the right to accept, reject, edit, or remove any photo at its sole discretion
- Photos may be reviewed by AI systems and human moderators
- We may contact you regarding your submission

7. INDEMNIFICATION
You agree to indemnify and hold harmless CR AudioViz AI, LLC, its officers, directors, employees, and agents from any claims, damages, or expenses arising from:
- Your photo submission
- Any breach of these terms
- Any infringement of third-party rights

8. REMOVAL REQUESTS
- You may request removal of your photo by contacting support@craudiovizai.com
- Removal requests will be processed within 30 days
- Previously distributed copies may persist in caches and archives

9. MODIFICATIONS
- These terms may be updated at any time
- Continued use constitutes acceptance of updated terms

By clicking "Submit" or uploading a photo, you confirm you have read, understood, and agree to these terms.

Last Updated: December 21, 2025
CR AudioViz AI, LLC | Fort Myers, Florida
  `.trim()
};

// ============================================================
// AI QUALITY EVALUATION (Using Anthropic Claude)
// ============================================================
async function evaluatePhotoQuality(imageUrl: string, spiritName: string, brandName?: string): Promise<{
  quality_score: number;
  clarity_score: number;
  lighting_score: number;
  composition_score: number;
  label_visibility_score: number;
  is_product_match: boolean;
  brand_match_confidence: number;
  ai_analysis: Record<string, unknown>;
  recommendation: 'approve' | 'reject' | 'review';
  rejection_reason?: string;
}> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicKey) {
    // Return default scores if no API key
    return {
      quality_score: 50,
      clarity_score: 50,
      lighting_score: 50,
      composition_score: 50,
      label_visibility_score: 50,
      is_product_match: false,
      brand_match_confidence: 0,
      ai_analysis: { error: 'No API key configured' },
      recommendation: 'review'
    };
  }
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'url',
                  url: imageUrl
                }
              },
              {
                type: 'text',
                text: `Evaluate this photo for a spirits/alcohol collection app. The user claims this is "${spiritName}"${brandName ? ` by "${brandName}"` : ''}.

Please analyze and respond with ONLY a JSON object (no markdown, no explanation):
{
  "clarity_score": <0-100>,
  "lighting_score": <0-100>,
  "composition_score": <0-100>,
  "label_visibility_score": <0-100>,
  "is_alcohol_product": <true/false>,
  "is_product_match": <true/false if it matches the claimed product>,
  "brand_match_confidence": <0-1>,
  "detected_brand": "<brand name if visible>",
  "detected_product": "<product name if visible>",
  "concerns": ["<any concerns>"],
  "recommendation": "<approve/reject/review>"
}

Scoring guide:
- clarity: Is image sharp and in focus?
- lighting: Is product well-lit without harsh shadows?
- composition: Is bottle well-framed and centered?
- label_visibility: Can branding/labels be clearly read?

Reject if: Not an alcohol product, inappropriate content, very poor quality (<30 average)
Review if: Uncertain match or moderate quality (30-70)
Approve if: Good quality (>70) and matches claimed product`
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.content?.[0]?.text || '{}';
    
    // Parse JSON response
    const analysis = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
    
    const avgQuality = Math.round(
      (analysis.clarity_score + analysis.lighting_score + 
       analysis.composition_score + analysis.label_visibility_score) / 4
    );
    
    return {
      quality_score: avgQuality,
      clarity_score: analysis.clarity_score || 50,
      lighting_score: analysis.lighting_score || 50,
      composition_score: analysis.composition_score || 50,
      label_visibility_score: analysis.label_visibility_score || 50,
      is_product_match: analysis.is_product_match || false,
      brand_match_confidence: analysis.brand_match_confidence || 0,
      ai_analysis: analysis,
      recommendation: analysis.recommendation || 'review',
      rejection_reason: analysis.concerns?.join(', ')
    };
    
  } catch (error) {
    console.error('AI evaluation error:', error);
    return {
      quality_score: 50,
      clarity_score: 50,
      lighting_score: 50,
      composition_score: 50,
      label_visibility_score: 50,
      is_product_match: false,
      brand_match_confidence: 0,
      ai_analysis: { error: error instanceof Error ? error.message : 'Unknown error' },
      recommendation: 'review'
    };
  }
}

// ============================================================
// GET: Get upload terms and guidelines
// ============================================================
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spiritId = searchParams.get('spiritId');
  
  // If spiritId provided, return existing photos for that spirit
  if (spiritId) {
    const supabase = getAnonClient();
    
    const { data: photos, error } = await supabase
      .from('bv_user_photos')
      .select(`
        id,
        image_url,
        thumbnail_url,
        quality_score,
        source,
        upvotes,
        is_primary,
        is_verified,
        created_at,
        user_id
      `)
      .eq('spirit_id', spiritId)
      .eq('status', 'approved')
      .order('is_primary', { ascending: false })
      .order('quality_score', { ascending: false })
      .order('upvotes', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      spiritId,
      photos: photos || [],
      count: photos?.length || 0
    });
  }
  
  // Return upload terms and guidelines
  return NextResponse.json({
    terms: PHOTO_UPLOAD_TERMS,
    guidelines: {
      acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
      maxFileSizeMB: 10,
      minDimensions: { width: 500, height: 500 },
      recommendedDimensions: { width: 1200, height: 1200 },
      tips: [
        'Use natural lighting when possible',
        'Ensure the label is clearly visible and readable',
        'Center the bottle in the frame',
        'Use a plain background for best results',
        'Take photos at eye level',
        'Avoid reflections and glare on the bottle'
      ]
    },
    endpoints: {
      upload: 'POST /api/photos',
      getPhotos: 'GET /api/photos?spiritId=<uuid>',
      vote: 'POST /api/photos/vote',
      setPreference: 'POST /api/photos/preference'
    }
  });
}

// ============================================================
// POST: Upload a new photo
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    // Get user from auth header
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || ''
        }
      }
    });
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please sign in to upload photos'
      }, { status: 401 });
    }
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const spiritId = formData.get('spiritId') as string;
    const termsAccepted = formData.get('termsAccepted') === 'true';
    
    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!spiritId) {
      return NextResponse.json({ error: 'spiritId required' }, { status: 400 });
    }
    
    if (!termsAccepted) {
      return NextResponse.json({ 
        error: 'Terms not accepted',
        message: 'You must accept the photo upload terms to continue',
        terms: PHOTO_UPLOAD_TERMS
      }, { status: 400 });
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type',
        message: 'Only JPEG, PNG, and WebP images are accepted'
      }, { status: 400 });
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large',
        message: 'Maximum file size is 10MB'
      }, { status: 400 });
    }
    
    const supabase = getServiceClient();
    
    // Verify spirit exists
    const { data: spirit, error: spiritError } = await supabase
      .from('bv_spirits')
      .select('id, name, brand')
      .eq('id', spiritId)
      .single();
    
    if (spiritError || !spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 });
    }
    
    // Get client IP
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : headersList.get('x-real-ip') || 'unknown';
    
    // Log terms acceptance
    await supabase.from('bv_photo_terms_log').insert({
      user_id: user.id,
      terms_version: PHOTO_UPLOAD_TERMS.version,
      terms_type: 'photo_upload',
      ip_address: ip !== 'unknown' ? ip : null,
      user_agent: headersList.get('user-agent'),
      terms_text: PHOTO_UPLOAD_TERMS.terms
    });
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${spiritId}/${user.id}/${timestamp}.${ext}`;
    
    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('spirit-images')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Upload failed',
        message: uploadError.message
      }, { status: 500 });
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('spirit-images')
      .getPublicUrl(filename);
    
    // Run AI quality evaluation
    const evaluation = await evaluatePhotoQuality(
      publicUrl, 
      spirit.name, 
      spirit.brand
    );
    
    // Determine initial status based on AI evaluation
    let status: 'pending' | 'approved' | 'rejected' = 'pending';
    if (evaluation.recommendation === 'approve' && evaluation.quality_score >= 70) {
      status = 'approved'; // Auto-approve high quality matches
    } else if (evaluation.recommendation === 'reject') {
      status = 'rejected';
    }
    
    // Create photo record
    const { data: photo, error: insertError } = await supabase
      .from('bv_user_photos')
      .insert({
        spirit_id: spiritId,
        user_id: user.id,
        image_url: publicUrl,
        thumbnail_url: publicUrl, // TODO: Generate actual thumbnail
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        quality_score: evaluation.quality_score,
        clarity_score: evaluation.clarity_score,
        lighting_score: evaluation.lighting_score,
        composition_score: evaluation.composition_score,
        label_visibility_score: evaluation.label_visibility_score,
        source: 'user_upload',
        license_type: 'user_submitted',
        rights_granted: true,
        terms_accepted_at: new Date().toISOString(),
        ip_address: ip !== 'unknown' ? ip : null,
        status,
        ai_analysis: evaluation.ai_analysis,
        is_product_match: evaluation.is_product_match,
        brand_match_confidence: evaluation.brand_match_confidence,
        moderation_notes: status === 'rejected' ? evaluation.rejection_reason : null
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      // Clean up uploaded file
      await supabase.storage.from('spirit-images').remove([filename]);
      return NextResponse.json({ 
        error: 'Failed to save photo record',
        message: insertError.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      photo: {
        id: photo.id,
        image_url: photo.image_url,
        status: photo.status,
        quality_score: photo.quality_score
      },
      evaluation: {
        quality_score: evaluation.quality_score,
        is_product_match: evaluation.is_product_match,
        recommendation: evaluation.recommendation
      },
      message: status === 'approved' 
        ? 'Photo uploaded and approved! Thank you for your contribution.'
        : status === 'rejected'
        ? `Photo rejected: ${evaluation.rejection_reason || 'Does not meet quality standards'}`
        : 'Photo uploaded and pending review. Thank you for your contribution!'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================
// DELETE: Remove a user's own photo
// ============================================================
export async function DELETE(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || ''
        }
      }
    });
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');
    
    if (!photoId) {
      return NextResponse.json({ error: 'photoId required' }, { status: 400 });
    }
    
    const supabase = getServiceClient();
    
    // Get photo to verify ownership
    const { data: photo, error: fetchError } = await supabase
      .from('bv_user_photos')
      .select('id, user_id, image_url')
      .eq('id', photoId)
      .single();
    
    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    
    if (photo.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this photo' }, { status: 403 });
    }
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('bv_user_photos')
      .delete()
      .eq('id', photoId);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    // Delete from storage (extract path from URL)
    const urlParts = photo.image_url.split('/spirit-images/');
    if (urlParts[1]) {
      await supabase.storage.from('spirit-images').remove([urlParts[1]]);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

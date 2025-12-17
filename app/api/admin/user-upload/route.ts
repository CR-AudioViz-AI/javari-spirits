// ============================================================
// BARRELVERSE - USER IMAGE UPLOAD API
// Crowdsourced images with legal rights for monetization
// Created: December 17, 2025
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

function getSupabaseAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: \`Bearer \${token}\` } : {}
    }
  });
  
  return client;
}

// Legal terms for user uploads - internal constant
const TERMS_VERSION = '1.0.0';
const TERMS_SUMMARY = \`By uploading images to CRAVBarrels, you grant CR AudioViz AI, LLC perpetual, 
worldwide, royalty-free license to use, modify, distribute, and sublicense the images 
for any purpose including commercial use and resale.\`;

// GET: Get upload terms and requirements
export async function GET(request: NextRequest) {
  const showFull = request.nextUrl.searchParams.get('full') === 'true';
  
  return NextResponse.json({
    service: 'CRAVBarrels Image Upload',
    operator: 'CR AudioViz AI, LLC',
    terms: {
      version: TERMS_VERSION,
      effectiveDate: '2025-12-17',
      summary: TERMS_SUMMARY
    },
    requirements: {
      authentication: 'Required (Bearer token)',
      acceptTerms: 'Must include termsAccepted: true in request',
      acceptTermsVersion: TERMS_VERSION,
      imageFormats: ['image/jpeg', 'image/png', 'image/webp'],
      maxFileSize: '10MB'
    }
  });
}

// POST: Upload image for a spirit
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAuth(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Please log in to upload images'
      }, { status: 401 });
    }
    
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const spiritId = formData.get('spiritId') as string | null;
    const termsAccepted = formData.get('termsAccepted') as string | null;
    const termsVersion = formData.get('termsVersion') as string | null;
    
    if (!image) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 });
    }
    
    if (!spiritId) {
      return NextResponse.json({ error: 'Spirit ID required' }, { status: 400 });
    }
    
    if (termsAccepted !== 'true') {
      return NextResponse.json({
        error: 'Terms not accepted',
        message: 'You must accept the Image Upload Terms of Service',
        terms: TERMS_SUMMARY
      }, { status: 400 });
    }
    
    if (termsVersion !== TERMS_VERSION) {
      return NextResponse.json({
        error: 'Terms version mismatch',
        requiredVersion: TERMS_VERSION
      }, { status: 400 });
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }
    
    const adminSupabase = getSupabaseAdmin();
    
    const { data: spirit, error: spiritError } = await adminSupabase
      .from('spirits')
      .select('id, name')
      .eq('id', spiritId)
      .single();
    
    if (spiritError || !spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 });
    }
    
    const timestamp = Date.now();
    const extension = image.type.split('/')[1];
    const filename = \`user-uploads/\${user.id}/\${spiritId}/\${timestamp}.\${extension}\`;
    
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const { error: uploadError } = await adminSupabase
      .storage
      .from('spirit-images')
      .upload(filename, buffer, { contentType: image.type, upsert: false });
    
    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed', details: uploadError.message }, { status: 500 });
    }
    
    const { data: urlData } = adminSupabase.storage.from('spirit-images').getPublicUrl(filename);
    
    return NextResponse.json({
      success: true,
      upload: {
        spiritId,
        spiritName: spirit.name,
        imageUrl: urlData.publicUrl,
        status: 'pending_review'
      },
      legal: { termsAccepted: true, termsVersion: TERMS_VERSION }
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

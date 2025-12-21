// ============================================================
// BARRELVERSE - USER IMAGE PREFERENCE API
// Allows users to choose which images appear in their collection
// Created: December 21, 2025
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================================
// GET: Get user's image preferences for a collection
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader || '' }
      }
    });
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const spiritId = searchParams.get('spiritId');
    
    const supabase = getServiceClient();
    
    // Build query
    let query = supabase
      .from('bv_collection_image_prefs')
      .select(`
        id,
        collection_id,
        spirit_id,
        preferred_image_url,
        preferred_image_source,
        user_photo_id,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id);
    
    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }
    
    if (spiritId) {
      query = query.eq('spirit_id', spiritId);
    }
    
    const { data: preferences, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      preferences: preferences || [],
      count: preferences?.length || 0
    });
    
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================
// POST: Set image preference for a spirit in a collection
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader || '' }
      }
    });
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const body = await request.json();
    const { collectionId, spiritId, imageUrl, imageSource, userPhotoId } = body;
    
    // Validate required fields
    if (!collectionId || !spiritId || !imageUrl) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['collectionId', 'spiritId', 'imageUrl']
      }, { status: 400 });
    }
    
    const supabase = getServiceClient();
    
    // Verify user owns this collection
    const { data: collection, error: collectionError } = await supabase
      .from('bv_user_collections')
      .select('id, user_id')
      .eq('id', collectionId)
      .single();
    
    if (collectionError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    
    if (collection.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to modify this collection' }, { status: 403 });
    }
    
    // Verify spirit exists
    const { data: spirit, error: spiritError } = await supabase
      .from('bv_spirits')
      .select('id, name')
      .eq('id', spiritId)
      .single();
    
    if (spiritError || !spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 });
    }
    
    // If userPhotoId provided, verify it exists and is approved
    if (userPhotoId) {
      const { data: photo, error: photoError } = await supabase
        .from('bv_user_photos')
        .select('id, image_url, status')
        .eq('id', userPhotoId)
        .single();
      
      if (photoError || !photo) {
        return NextResponse.json({ error: 'User photo not found' }, { status: 404 });
      }
      
      if (photo.status !== 'approved') {
        return NextResponse.json({ 
          error: 'Cannot use unapproved photo',
          message: 'This photo is still pending review'
        }, { status: 400 });
      }
    }
    
    // Upsert the preference
    const { data: preference, error: upsertError } = await supabase
      .from('bv_collection_image_prefs')
      .upsert({
        collection_id: collectionId,
        spirit_id: spiritId,
        user_id: user.id,
        preferred_image_url: imageUrl,
        preferred_image_source: imageSource || 'user_selected',
        user_photo_id: userPhotoId || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'collection_id,spirit_id'
      })
      .select()
      .single();
    
    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      preference,
      message: 'Image preference saved successfully'
    });
    
  } catch (error) {
    console.error('Set preference error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================
// DELETE: Remove image preference (reset to default)
// ============================================================
export async function DELETE(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader || '' }
      }
    });
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const spiritId = searchParams.get('spiritId');
    
    if (!collectionId || !spiritId) {
      return NextResponse.json({ 
        error: 'Missing required parameters',
        required: ['collectionId', 'spiritId']
      }, { status: 400 });
    }
    
    const supabase = getServiceClient();
    
    // Delete the preference (RLS will ensure user ownership)
    const { error: deleteError } = await supabase
      .from('bv_collection_image_prefs')
      .delete()
      .eq('collection_id', collectionId)
      .eq('spirit_id', spiritId)
      .eq('user_id', user.id);
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Image preference removed. Spirit will use default image.'
    });
    
  } catch (error) {
    console.error('Delete preference error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

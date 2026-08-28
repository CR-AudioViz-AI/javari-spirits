// ============================================================
// BARRELVERSE - PHOTO VOTING API
// Allows users to upvote/downvote community photos
// Created: December 21, 2025
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, anonDb } from '@/lib/supabase/admin';
import { headers } from 'next/headers';
import { secretKey, publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";

const SUPABASE_URL = supabaseUrl();
const supabaseServiceKey = secretKey();
const supabaseAnonKey = publishableKey();

function getServiceClient() {
  return adminDb();
}

// ============================================================
// POST: Vote on a photo
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    const supabaseAuth = anonDb(authHeader);
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const body = await request.json();
    const { photoId, voteType } = body; // voteType: 'up' | 'down' | 'remove'
    
    if (!photoId) {
      return NextResponse.json({ error: 'photoId required' }, { status: 400 });
    }
    
    if (!['up', 'down', 'remove'].includes(voteType)) {
      return NextResponse.json({ 
        error: 'Invalid voteType',
        validValues: ['up', 'down', 'remove']
      }, { status: 400 });
    }
    
    const supabase = getServiceClient();
    
    // Get the photo
    const { data: photo, error: photoError } = await supabase
      .from('bv_user_photos')
      .select('id, user_id, upvotes, downvotes, status')
      .eq('id', photoId)
      .single();
    
    if (photoError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    
    // Can't vote on unapproved photos
    if (photo.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Cannot vote on unapproved photos'
      }, { status: 400 });
    }
    
    // Can't vote on your own photo
    if (photo.user_id === user.id) {
      return NextResponse.json({ 
        error: 'Cannot vote on your own photo'
      }, { status: 400 });
    }
    
    // Check for existing vote (stored in a separate table or JSONB)
    // For simplicity, we'll use a votes tracking table
    // First, try to create the votes table if it doesn't exist
    
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('bv_photo_votes')
      .select('id, vote_type')
      .eq('photo_id', photoId)
      .eq('user_id', user.id)
      .single();
    
    let upvoteDelta = 0;
    let downvoteDelta = 0;
    
    if (existingVote) {
      if (voteType === 'remove') {
        // Remove existing vote
        await supabase
          .from('bv_photo_votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (existingVote.vote_type === 'up') upvoteDelta = -1;
        if (existingVote.vote_type === 'down') downvoteDelta = -1;
      } else if (existingVote.vote_type !== voteType) {
        // Change vote
        await supabase
          .from('bv_photo_votes')
          .update({ vote_type: voteType, updated_at: new Date().toISOString() })
          .eq('id', existingVote.id);
        
        if (existingVote.vote_type === 'up') upvoteDelta = -1;
        if (existingVote.vote_type === 'down') downvoteDelta = -1;
        if (voteType === 'up') upvoteDelta += 1;
        if (voteType === 'down') downvoteDelta += 1;
      }
      // If same vote type, do nothing
    } else if (voteType !== 'remove') {
      // Create new vote
      await supabase
        .from('bv_photo_votes')
        .insert({
          photo_id: photoId,
          user_id: user.id,
          vote_type: voteType
        });
      
      if (voteType === 'up') upvoteDelta = 1;
      if (voteType === 'down') downvoteDelta = 1;
    }
    
    // Update photo vote counts
    if (upvoteDelta !== 0 || downvoteDelta !== 0) {
      const { error: updateError } = await supabase
        .from('bv_user_photos')
        .update({
          upvotes: Math.max(0, (photo.upvotes || 0) + upvoteDelta),
          downvotes: Math.max(0, (photo.downvotes || 0) + downvoteDelta),
          updated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      if (updateError) {
        console.error('Vote update error:', updateError);
      }
    }
    
    // Get updated photo
    const { data: updatedPhoto } = await supabase
      .from('bv_user_photos')
      .select('id, upvotes, downvotes')
      .eq('id', photoId)
      .single();
    
    return NextResponse.json({
      success: true,
      photoId,
      action: voteType,
      upvotes: updatedPhoto?.upvotes || 0,
      downvotes: updatedPhoto?.downvotes || 0,
      score: (updatedPhoto?.upvotes || 0) - (updatedPhoto?.downvotes || 0)
    });
    
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================
// GET: Get user's vote on a photo
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    const supabaseAuth = anonDb(authHeader);
    
    const { data: { user } } = await supabaseAuth.auth.getUser();
    
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');
    
    if (!photoId) {
      return NextResponse.json({ error: 'photoId required' }, { status: 400 });
    }
    
    const supabase = getServiceClient();
    
    // Get photo stats
    const { data: photo, error: photoError } = await supabase
      .from('bv_user_photos')
      .select('id, upvotes, downvotes')
      .eq('id', photoId)
      .single();
    
    if (photoError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    
    let userVote: string | null = null;
    
    if (user) {
      const { data: vote } = await supabase
        .from('bv_photo_votes')
        .select('vote_type')
        .eq('photo_id', photoId)
        .eq('user_id', user.id)
        .single();
      
      userVote = vote?.vote_type || null;
    }
    
    return NextResponse.json({
      photoId,
      upvotes: photo.upvotes || 0,
      downvotes: photo.downvotes || 0,
      score: (photo.upvotes || 0) - (photo.downvotes || 0),
      userVote
    });
    
  } catch (error) {
    console.error('Get vote error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

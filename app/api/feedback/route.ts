/**
 * FEEDBACK API
 * ============
 * Collects user feedback, bug reports, and feature requests
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

const supabase = lazyAdminDb();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, context, url } = body;

    // Get user from session if available
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('sb-kteobfyferrukqeolofj-auth-token');
    let userId = null;

    if (sessionCookie) {
      const { data: { user } } = await supabase.auth.getUser(sessionCookie.value);
      userId = user?.id || null;
    }

    // Determine where to store based on type
    if (type === 'feature') {
      // Feature request - goes to feature_requests table
      const { data, error } = await supabase
        .from('bv_feature_requests')
        .insert({
          user_id: userId,
          title: message.substring(0, 100),
          description: message,
          category: context || 'general',
          votes: 1,
          status: 'submitted',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      // Auto-vote for submitter
      if (userId && data) {
        await supabase
          .from('bv_feature_votes')
          .insert({ feature_id: data.id, user_id: userId });
      }

      // Notify user
      if (userId) {
        await supabase
          .from('bv_notifications')
          .insert({
            user_id: userId,
            type: 'feature_submitted',
            title: 'Feature Request Received!',
            message: 'Thank you for your suggestion. Other users can now vote on it!',
            metadata: { featureId: data?.id }
          });
      }

      return NextResponse.json({ 
        success: true, 
        type: 'feature',
        id: data?.id 
      });

    } else if (type === 'bug') {
      // Bug report - goes to tickets table
      const { data, error } = await supabase
        .from('bv_tickets')
        .insert({
          user_id: userId,
          type: 'bug',
          priority: 'medium',
          status: 'open',
          subject: `Bug Report: ${message.substring(0, 50)}...`,
          description: `**User Report:**\n${message}\n\n**Page:** ${url || 'Unknown'}\n**Context:** ${context || 'Unknown'}`,
          assigned_to: 'bot',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      // Notify user
      if (userId) {
        await supabase
          .from('bv_notifications')
          .insert({
            user_id: userId,
            type: 'ticket_created',
            title: 'Bug Report Received',
            message: `Thank you for reporting this issue. Ticket #${data?.id.slice(0, 8)} has been created.`,
            metadata: { ticketId: data?.id }
          });
      }

      return NextResponse.json({ 
        success: true, 
        type: 'bug',
        ticketId: data?.id 
      });

    } else {
      // General feedback - also goes to tickets as feedback type
      const { data, error } = await supabase
        .from('bv_tickets')
        .insert({
          user_id: userId,
          type: 'feedback',
          priority: 'low',
          status: 'open',
          subject: `Feedback: ${message.substring(0, 50)}...`,
          description: `**User Feedback:**\n${message}\n\n**Page:** ${url || 'Unknown'}`,
          assigned_to: 'bot',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        type: 'feedback',
        id: data?.id 
      });
    }

  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

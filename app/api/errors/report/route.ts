/**
 * ERROR REPORTING API
 * ===================
 * Receives client-side errors and creates tickets
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error, errorInfo, context, userId } = body;

    // Check for duplicate errors (same message in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: existingTicket } = await supabase
      .from('bv_tickets')
      .select('id, occurrence_count')
      .eq('type', 'auto_error')
      .ilike('subject', `%${error.message?.substring(0, 50) || 'Unknown'}%`)
      .gte('created_at', oneHourAgo)
      .single();

    if (existingTicket) {
      // Increment occurrence count
      await supabase
        .from('bv_tickets')
        .update({ 
          occurrence_count: (existingTicket.occurrence_count || 1) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTicket.id);

      return NextResponse.json({
        success: true,
        ticketId: existingTicket.id,
        duplicate: true
      });
    }

    // Create new ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('bv_tickets')
      .insert({
        user_id: userId || null,
        type: 'auto_error',
        priority: 'high',
        status: 'open',
        subject: `Auto-detected: ${error.message?.substring(0, 100) || 'Unknown Error'}`,
        description: `An error was automatically detected:

**Error Type:** ${error.name || 'Error'}
**Message:** ${error.message || 'No message'}
**URL:** ${context?.url || 'Unknown'}
**Timestamp:** ${context?.timestamp || new Date().toISOString()}

**Stack Trace:**
\`\`\`
${error.stack?.substring(0, 1000) || 'No stack trace'}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo?.componentStack?.substring(0, 500) || 'N/A'}
\`\`\``,
        error_details: {
          error_type: error.name,
          error_message: error.message,
          stack_trace: error.stack,
          url: context?.url,
          user_agent: context?.userAgent,
          component: errorInfo?.componentStack?.split('\n')[1]?.trim(),
          global: context?.global
        },
        assigned_to: 'javari',
        auto_fixed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (ticketError) {
      console.error('Failed to create ticket:', ticketError);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    // Log to error log
    await supabase
      .from('bv_error_log')
      .insert({
        ticket_id: ticket.id,
        user_id: userId || null,
        error_type: error.name || 'Error',
        error_message: error.message || 'Unknown',
        stack_trace: error.stack,
        url: context?.url,
        user_agent: context?.userAgent,
        component: errorInfo?.componentStack?.split('\n')[1]?.trim()
      });

    // Notify user if logged in
    if (userId) {
      await supabase
        .from('bv_notifications')
        .insert({
          user_id: userId,
          type: 'ticket_created',
          title: 'Issue Reported',
          message: `We noticed something went wrong. Ticket #${ticket.id.slice(0, 8)} has been created and our team is on it!`,
          metadata: { ticketId: ticket.id }
        });
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket.id
    });

  } catch (err) {
    console.error('Error report failed:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

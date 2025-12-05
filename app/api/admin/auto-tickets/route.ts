/**
 * AUTO-TICKETS API
 * ================
 * Manages automatically generated support tickets from errors,
 * user feedback, and system monitoring.
 * 
 * Features:
 * - Auto-ticket creation from error events
 * - Priority-based sorting
 * - Status management
 * - Metrics and analytics
 * 
 * CR AudioViz AI, LLC - BarrelVerse
 * Timestamp: 2025-12-05
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List auto tickets with filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const severity = searchParams.get('severity')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    let query = supabase
      .from('bv_auto_tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)
    if (severity) query = query.eq('severity', severity)

    const { data, error, count } = await query

    if (error) throw error

    // Get stats
    const { data: stats } = await supabase
      .from('bv_auto_tickets')
      .select('status, severity')
    
    const summary = {
      total: count || 0,
      by_status: {} as Record<string, number>,
      by_severity: {} as Record<string, number>
    }

    stats?.forEach(t => {
      summary.by_status[t.status] = (summary.by_status[t.status] || 0) + 1
      summary.by_severity[t.severity] = (summary.by_severity[t.severity] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      tickets: data,
      summary,
      pagination: { limit, offset, total: count }
    })
  } catch (error) {
    console.error('Auto-tickets fetch error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST - Create auto ticket (from error handler or system)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const ticket = {
      ticket_type: body.ticket_type || 'error',
      title: body.title,
      description: body.description,
      source: body.source || 'system',
      severity: body.severity || 'medium',
      status: 'open',
      auto_generated: true,
      error_details: body.error_details || null,
      user_id: body.user_id || null
    }

    const { data, error } = await supabase
      .from('bv_auto_tickets')
      .insert(ticket)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      ticket: data,
      message: 'Auto-ticket created successfully'
    })
  } catch (error) {
    console.error('Auto-ticket creation error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// PATCH - Update ticket status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, assigned_to } = body

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }
    
    if (status) updates.status = status
    if (assigned_to) updates.assigned_to = assigned_to
    if (status === 'resolved') updates.resolved_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('bv_auto_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      ticket: data,
      message: 'Ticket updated successfully'
    })
  } catch (error) {
    console.error('Auto-ticket update error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

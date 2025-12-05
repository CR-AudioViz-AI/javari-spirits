/**
 * SCHEDULED CONTENT API
 * =====================
 * Manages scheduled content publishing for BarrelVerse.
 * Allows content to be queued for future publication.
 * 
 * Actions:
 * - publish: Make content live
 * - unpublish: Remove from public view
 * - feature: Highlight on homepage
 * - unfeature: Remove from featured
 * - notify: Send notifications about content
 * 
 * CR AudioViz AI, LLC - BarrelVerse
 * Timestamp: 2025-12-05
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List scheduled content
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'
  const contentType = searchParams.get('content_type')
  const upcoming = searchParams.get('upcoming') === 'true'

  try {
    let query = supabase
      .from('bv_scheduled_content')
      .select('*')
      .order('scheduled_for', { ascending: true })

    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    if (upcoming) {
      query = query.gte('scheduled_for', new Date().toISOString())
    }

    const { data, error } = await query.limit(100)

    if (error) throw error

    // Group by date for calendar view
    const byDate: Record<string, any[]> = {}
    data?.forEach(item => {
      const date = item.scheduled_for.split('T')[0]
      if (!byDate[date]) byDate[date] = []
      byDate[date].push(item)
    })

    return NextResponse.json({
      success: true,
      scheduled: data,
      by_date: byDate,
      total: data?.length || 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Scheduled content fetch error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST - Schedule new content action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const scheduled = {
      content_type: body.content_type,
      content_id: body.content_id,
      action: body.action,
      scheduled_for: body.scheduled_for,
      payload: body.payload || {},
      status: 'pending'
    }

    // Validate scheduled time is in the future
    if (new Date(scheduled.scheduled_for) <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('bv_scheduled_content')
      .insert(scheduled)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      scheduled: data,
      message: `Content scheduled for ${body.action} at ${body.scheduled_for}`
    })
  } catch (error) {
    console.error('Schedule content error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// PATCH - Update scheduled content or execute immediately
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (action === 'execute_now') {
      // Execute the scheduled action immediately
      const { data: scheduled, error: fetchError } = await supabase
        .from('bv_scheduled_content')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Execute based on action type
      const result = await executeScheduledAction(scheduled)

      // Update status
      const { error: updateError } = await supabase
        .from('bv_scheduled_content')
        .update({
          status: result.success ? 'executed' : 'failed',
          executed_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        result,
        message: 'Scheduled action executed'
      })
    }

    // Regular update
    const updates: Record<string, any> = {}
    if (body.scheduled_for) updates.scheduled_for = body.scheduled_for
    if (body.action) updates.action = body.action
    if (body.payload) updates.payload = body.payload

    const { data, error } = await supabase
      .from('bv_scheduled_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      scheduled: data,
      message: 'Schedule updated'
    })
  } catch (error) {
    console.error('Update scheduled content error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE - Cancel scheduled content
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID required' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from('bv_scheduled_content')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      cancelled: data,
      message: 'Scheduled content cancelled'
    })
  } catch (error) {
    console.error('Cancel scheduled content error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// Helper: Execute a scheduled action
async function executeScheduledAction(scheduled: any) {
  const { content_type, content_id, action, payload } = scheduled

  try {
    switch (action) {
      case 'publish':
        await supabase
          .from(`bv_${content_type}`)
          .update({ status: 'published', published_at: new Date().toISOString() })
          .eq('id', content_id)
        break

      case 'unpublish':
        await supabase
          .from(`bv_${content_type}`)
          .update({ status: 'draft' })
          .eq('id', content_id)
        break

      case 'feature':
        await supabase
          .from(`bv_${content_type}`)
          .update({ featured: true, featured_at: new Date().toISOString() })
          .eq('id', content_id)
        break

      case 'unfeature':
        await supabase
          .from(`bv_${content_type}`)
          .update({ featured: false })
          .eq('id', content_id)
        break

      case 'notify':
        // Queue notification
        await supabase
          .from('bv_ai_tasks')
          .insert({
            task_type: 'notification',
            task_name: `Notify about ${content_type}`,
            parameters: { content_type, content_id, ...payload },
            priority: 3,
            status: 'queued'
          })
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return { success: true, action }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

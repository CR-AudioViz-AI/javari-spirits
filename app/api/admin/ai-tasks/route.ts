/**
 * AI TASKS QUEUE API
 * ==================
 * Manages the autonomous AI task queue for BarrelVerse.
 * Tasks include content generation, analysis, and system maintenance.
 * 
 * Task Types:
 * - content_generation: Generate new spirits, trivia, courses
 * - knowledge_creation: Create help articles from tickets
 * - analysis: Analyze user behavior, trends
 * - maintenance: Database cleanup, optimization
 * - notification: Send scheduled notifications
 * 
 * CR AudioViz AI, LLC - BarrelVerse
 * Timestamp: 2025-12-06
 */

import { NextRequest, NextResponse } from 'next/server'
import { lazyAdminDb } from '@/lib/supabase/admin';
// Define types
interface QueueStatusItem {
  status: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = lazyAdminDb()

// GET - List AI tasks with filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const taskType = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    let query = supabase
      .from('bv_ai_tasks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)
    if (taskType) query = query.eq('task_type', taskType)

    const { data, error, count } = await query

    if (error) throw error

    // Get queue stats
    const { data: queueStats } = await supabase
      .from('bv_ai_tasks')
      .select('status')
      .in('status', ['queued', 'processing'])

    const stats = {
      total: count || 0,
      queued: (queueStats as QueueStatusItem[] | null)?.filter((t: QueueStatusItem) => t.status === 'queued').length || 0,
      processing: (queueStats as QueueStatusItem[] | null)?.filter((t: QueueStatusItem) => t.status === 'processing').length || 0
    }

    return NextResponse.json({
      success: true,
      tasks: data,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI tasks fetch error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST - Queue a new AI task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const task = {
      task_type: body.task_type,
      task_name: body.task_name,
      parameters: body.parameters || {},
      priority: body.priority || 5,
      status: 'queued',
      scheduled_for: body.scheduled_for || new Date().toISOString(),
      max_attempts: body.max_attempts || 3
    }

    const { data, error } = await supabase
      .from('bv_ai_tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      task: data,
      message: 'AI task queued successfully'
    })
  } catch (error) {
    console.error('AI task creation error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// PATCH - Update task status (used by task processor)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, result, error_message } = body

    const updates: Record<string, unknown> = {}
    
    if (status) {
      updates.status = status
      
      if (status === 'processing') {
        updates.started_at = new Date().toISOString()
        updates.attempts = supabase.rpc('increment_attempts', { task_id: id })
      }
      
      if (status === 'completed' || status === 'failed') {
        updates.completed_at = new Date().toISOString()
      }
    }
    
    if (result) updates.result = result
    if (error_message) updates.error_message = error_message

    const { data, error } = await supabase
      .from('bv_ai_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      task: data,
      message: 'Task updated successfully'
    })
  } catch (error) {
    console.error('AI task update error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE - Cancel a queued task
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Task ID required' },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from('bv_ai_tasks')
      .update({ status: 'cancelled', completed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'queued') // Can only cancel queued tasks
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      task: data,
      message: 'Task cancelled successfully'
    })
  } catch (error) {
    console.error('AI task cancel error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

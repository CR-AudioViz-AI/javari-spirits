/**
 * BARRELVERSE AUTONOMOUS CRON JOBS
 * ================================
 * Enhanced cron jobs that power the "living platform" features.
 * 
 * Schedule (Vercel Cron):
 * - Every 5 min: Health checks
 * - Every hour: Task processing, metrics recording
 * - Daily at 3 AM: Content refresh, cleanup
 * - Weekly (Monday 4 AM): Deep analysis, optimization
 * 
 * CR AudioViz AI, LLC - BarrelVerse
 * Timestamp: 2025-12-05
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processTaskQueue } from '@/lib/automation/task-processor'
import { reportCronError } from '@/lib/automation/error-handler'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Runtime config
export const runtime = 'nodejs'
export const maxDuration = 60

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) return true // Dev mode
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const job = searchParams.get('job')

  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  console.log(`[Cron] Starting job: ${job}`)

  try {
    let result: any

    switch (job) {
      case 'health':
        result = await runHealthCheck()
        break
      case 'hourly':
        result = await runHourlyTasks()
        break
      case 'daily':
        result = await runDailyTasks()
        break
      case 'weekly':
        result = await runWeeklyTasks()
        break
      case 'process_tasks':
        result = await runTaskProcessor()
        break
      case 'scheduled_content':
        result = await runScheduledContent()
        break
      default:
        return NextResponse.json({ error: 'Unknown job' }, { status: 400 })
    }

    const duration = Date.now() - startTime
    console.log(`[Cron] Job ${job} completed in ${duration}ms`)

    return NextResponse.json({
      job,
      success: true,
      ...result,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[Cron] Job ${job} failed:`, error)
    
    // Auto-create ticket for cron failure
    await reportCronError(job || 'unknown', error as Error)

    return NextResponse.json({
      job,
      success: false,
      error: (error as Error).message,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * HEALTH CHECK - Every 5 minutes
 * Records system health status
 */
async function runHealthCheck() {
  const checks: Array<{ check_type: string; check_name: string; status: string; response_time_ms: number; details: any }> = []

  // Database check
  const dbStart = Date.now()
  try {
    const { data, error } = await supabase.from('bv_spirits').select('id').limit(1)
    checks.push({
      check_type: 'database',
      check_name: 'Supabase Connection',
      status: error ? 'unhealthy' : 'healthy',
      response_time_ms: Date.now() - dbStart,
      details: error ? { error: error.message } : { connected: true }
    })
  } catch (e) {
    checks.push({
      check_type: 'database',
      check_name: 'Supabase Connection',
      status: 'unhealthy',
      response_time_ms: Date.now() - dbStart,
      details: { error: (e as Error).message }
    })
  }

  // Check queue depth
  const { count: queuedTasks } = await supabase
    .from('bv_ai_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'queued')

  checks.push({
    check_type: 'queue',
    check_name: 'AI Task Queue',
    status: (queuedTasks || 0) > 100 ? 'degraded' : 'healthy',
    response_time_ms: 0,
    details: { queued: queuedTasks || 0 }
  })

  // Check error rate
  const { count: recentErrors } = await supabase
    .from('bv_auto_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('ticket_type', 'error')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())

  checks.push({
    check_type: 'errors',
    check_name: 'Error Rate',
    status: (recentErrors || 0) > 10 ? 'degraded' : 'healthy',
    response_time_ms: 0,
    details: { errors_last_hour: recentErrors || 0 }
  })

  // Record cron execution
  checks.push({
    check_type: 'cron',
    check_name: 'Health Cron',
    status: 'healthy',
    response_time_ms: 0,
    details: { executed: true }
  })

  // Save all checks
  await supabase.from('bv_system_health').insert(checks)

  return {
    checks_performed: checks.length,
    overall_status: checks.some(c => c.status === 'unhealthy') ? 'unhealthy' :
                    checks.some(c => c.status === 'degraded') ? 'degraded' : 'healthy'
  }
}

/**
 * HOURLY TASKS
 * Process queued tasks, record metrics
 */
async function runHourlyTasks() {
  const results: Record<string, any> = {}

  // 1. Process AI task queue
  results.task_processing = await processTaskQueue(20)

  // 2. Record hourly metrics
  const { count: users } = await supabase
    .from('bv_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: spirits } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true })

  const { count: reviews } = await supabase
    .from('bv_reviews')
    .select('*', { count: 'exact', head: true })

  await supabase.from('bv_growth_metrics').insert([
    { metric_type: 'users_total', metric_value: users || 0 },
    { metric_type: 'spirits_total', metric_value: spirits || 0 },
    { metric_type: 'reviews_total', metric_value: reviews || 0 }
  ])

  results.metrics_recorded = 3

  // 3. Check for scheduled content to execute
  const { data: pendingContent } = await supabase
    .from('bv_scheduled_content')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())

  if (pendingContent && pendingContent.length > 0) {
    results.scheduled_content = {
      found: pendingContent.length,
      note: 'Content will be processed by scheduled_content cron'
    }
  }

  return results
}

/**
 * DAILY TASKS - 3 AM
 * Cleanup, aggregation, daily summaries
 */
async function runDailyTasks() {
  const results: Record<string, any> = {}

  // 1. Queue cleanup tasks
  await supabase.from('bv_ai_tasks').insert([
    {
      task_type: 'maintenance',
      task_name: 'Daily cleanup - old tasks',
      parameters: { action: 'cleanup_old_tasks' },
      priority: 8,
      status: 'queued'
    },
    {
      task_type: 'maintenance',
      task_name: 'Daily cleanup - old health records',
      parameters: { action: 'cleanup_old_health' },
      priority: 8,
      status: 'queued'
    }
  ])

  results.cleanup_tasks_queued = 2

  // 2. Record daily aggregate metrics
  const today = new Date().toISOString().split('T')[0]
  
  // Count new items from today
  const { count: newUsers } = await supabase
    .from('bv_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`)

  const { count: newReviews } = await supabase
    .from('bv_reviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`)

  const { count: newTickets } = await supabase
    .from('bv_auto_tickets')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`)

  await supabase.from('bv_growth_metrics').insert([
    { metric_type: 'daily_new_users', metric_value: newUsers || 0, metric_date: today },
    { metric_type: 'daily_new_reviews', metric_value: newReviews || 0, metric_date: today },
    { metric_type: 'daily_tickets', metric_value: newTickets || 0, metric_date: today }
  ])

  results.daily_metrics = {
    new_users: newUsers || 0,
    new_reviews: newReviews || 0,
    tickets: newTickets || 0
  }

  // 3. Queue analysis task
  await supabase.from('bv_ai_tasks').insert({
    task_type: 'analysis',
    task_name: 'Daily error pattern analysis',
    parameters: { analysis_type: 'error_patterns' },
    priority: 5,
    status: 'queued'
  })

  results.analysis_queued = true

  return results
}

/**
 * WEEKLY TASKS - Monday 4 AM
 * Deep analysis, optimization
 */
async function runWeeklyTasks() {
  const results: Record<string, any> = {}

  // 1. Queue comprehensive analysis
  await supabase.from('bv_ai_tasks').insert([
    {
      task_type: 'analysis',
      task_name: 'Weekly growth summary',
      parameters: { analysis_type: 'growth_summary' },
      priority: 5,
      status: 'queued'
    }
  ])

  results.analysis_queued = true

  // 2. Generate weekly report metrics
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const { count: weeklyUsers } = await supabase
    .from('bv_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo)

  const { count: weeklyTickets } = await supabase
    .from('bv_auto_tickets')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo)

  const { count: resolvedTickets } = await supabase
    .from('bv_auto_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'resolved')
    .gte('resolved_at', weekAgo)

  results.weekly_summary = {
    new_users: weeklyUsers || 0,
    total_tickets: weeklyTickets || 0,
    resolved_tickets: resolvedTickets || 0,
    resolution_rate: weeklyTickets ? Math.round((resolvedTickets || 0) / weeklyTickets * 100) : 0
  }

  return results
}

/**
 * TASK PROCESSOR - Called separately or from hourly
 */
async function runTaskProcessor() {
  return await processTaskQueue(50)
}

/**
 * SCHEDULED CONTENT - Process pending scheduled actions
 */
async function runScheduledContent() {
  const { data: pending } = await supabase
    .from('bv_scheduled_content')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())

  if (!pending || pending.length === 0) {
    return { processed: 0, message: 'No pending scheduled content' }
  }

  let executed = 0
  let failed = 0

  for (const item of pending) {
    try {
      // Execute based on action type
      switch (item.action) {
        case 'publish':
          await supabase
            .from(`bv_${item.content_type}`)
            .update({ status: 'published', published_at: new Date().toISOString() })
            .eq('id', item.content_id)
          break
        case 'feature':
          await supabase
            .from(`bv_${item.content_type}`)
            .update({ featured: true, featured_at: new Date().toISOString() })
            .eq('id', item.content_id)
          break
        // Add other actions as needed
      }

      await supabase
        .from('bv_scheduled_content')
        .update({ status: 'executed', executed_at: new Date().toISOString() })
        .eq('id', item.id)

      executed++
    } catch (e) {
      await supabase
        .from('bv_scheduled_content')
        .update({ status: 'failed' })
        .eq('id', item.id)
      failed++
    }
  }

  return { processed: pending.length, executed, failed }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}

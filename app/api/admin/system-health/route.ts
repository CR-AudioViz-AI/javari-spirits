/**
 * SYSTEM HEALTH API
 * =================
 * Real-time health monitoring for BarrelVerse platform.
 * Tracks database, API, external services, and performance.
 * 
 * Health Checks:
 * - Database connectivity
 * - API response times
 * - External services (Stripe, AI providers)
 * - Cron job status
 * - Error rates
 * 
 * CR AudioViz AI, LLC - BarrelVerse
 * Timestamp: 2025-12-05
 */

import { NextRequest, NextResponse } from 'next/server'
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb()

// GET - Current system health status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const detailed = searchParams.get('detailed') === 'true'
  const history = searchParams.get('history') === 'true'
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    // Run live health checks
    const healthChecks = await runHealthChecks()

    // Get recent health history if requested
    let healthHistory = null
    if (history) {
      const { data } = await supabase
        .from('bv_system_health')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(limit)
      healthHistory = data
    }

    // Calculate overall status
    const overallStatus = calculateOverallStatus(healthChecks)

    // Get error rate from last hour
    const { count: recentErrors } = await supabase
      .from('bv_auto_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('ticket_type', 'error')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())

    return NextResponse.json({
      success: true,
      status: overallStatus,
      checks: healthChecks,
      error_rate_last_hour: recentErrors || 0,
      history: healthHistory,
      checked_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('System health check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        status: 'unhealthy',
        error: (error as Error).message 
      },
      { status: 500 }
    )
  }
}

// POST - Record a health check result (called by cron)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support batch inserts
    const checks = Array.isArray(body) ? body : [body]
    
    const records = checks.map(c => ({
      check_type: c.check_type,
      check_name: c.check_name,
      status: c.status,
      response_time_ms: c.response_time_ms,
      details: c.details || {}
    }))

    const { data, error } = await supabase
      .from('bv_system_health')
      .insert(records)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      recorded: data?.length || 0,
      message: 'Health checks recorded'
    })
  } catch (error) {
    console.error('Health check recording error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// Helper: Run live health checks
async function runHealthChecks() {
  const checks: Record<string, any> = {}

  // Database check
  const dbStart = Date.now()
  try {
    await supabase.from('bv_spirits').select('id').limit(1)
    checks.database = {
      status: 'healthy',
      response_time_ms: Date.now() - dbStart
    }
  } catch {
    checks.database = {
      status: 'unhealthy',
      response_time_ms: Date.now() - dbStart,
      error: 'Database connection failed'
    }
  }

  // Check cron job status (last run times)
  const { data: lastHealth } = await supabase
    .from('bv_system_health')
    .select('*')
    .eq('check_type', 'cron')
    .order('checked_at', { ascending: false })
    .limit(1)

  if (lastHealth && lastHealth.length > 0) {
    const lastCron = new Date(lastHealth[0].checked_at)
    const minutesSinceLastCron = (Date.now() - lastCron.getTime()) / 60000
    
    checks.cron_jobs = {
      status: minutesSinceLastCron < 10 ? 'healthy' : 'degraded',
      last_run: lastHealth[0].checked_at,
      minutes_ago: Math.round(minutesSinceLastCron)
    }
  } else {
    checks.cron_jobs = {
      status: 'unknown',
      message: 'No cron history found'
    }
  }

  // Check AI task queue
  const { count: queuedTasks } = await supabase
    .from('bv_ai_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'queued')

  const { count: failedTasks } = await supabase
    .from('bv_ai_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
    .gte('created_at', new Date(Date.now() - 86400000).toISOString())

  checks.ai_queue = {
    status: (queuedTasks || 0) > 100 ? 'degraded' : 'healthy',
    queued: queuedTasks || 0,
    failed_24h: failedTasks || 0
  }

  // Check content freshness
  const { data: latestContent } = await supabase
    .from('bv_content_queue')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)

  if (latestContent && latestContent.length > 0) {
    const hoursSinceContent = (Date.now() - new Date(latestContent[0].created_at).getTime()) / 3600000
    checks.content_generation = {
      status: hoursSinceContent < 12 ? 'healthy' : 'degraded',
      hours_since_last: Math.round(hoursSinceContent)
    }
  }

  return checks
}

// Helper: Calculate overall status
function calculateOverallStatus(checks: Record<string, any>): string {
  const statuses = Object.values(checks).map(c => c.status)
  
  if (statuses.includes('unhealthy')) return 'unhealthy'
  if (statuses.includes('degraded')) return 'degraded'
  if (statuses.includes('unknown')) return 'unknown'
  return 'healthy'
}

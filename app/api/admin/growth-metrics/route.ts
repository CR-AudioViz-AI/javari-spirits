/**
 * GROWTH METRICS API
 * ==================
 * Tracks and reports platform growth metrics for the
 * BarrelVerse admin dashboard.
 * 
 * Metrics tracked:
 * - User registrations
 * - Content creation (spirits, courses, trivia)
 * - Engagement (reviews, collections, achievements)
 * - Revenue (subscriptions, marketplace)
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

// GET - Retrieve growth metrics with optional date range
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  const metricType = searchParams.get('type')
  const period = searchParams.get('period') || 'daily' // daily, weekly, monthly

  try {
    let query = supabase
      .from('bv_growth_metrics')
      .select('*')
      .order('metric_date', { ascending: false })

    if (startDate) query = query.gte('metric_date', startDate)
    if (endDate) query = query.lte('metric_date', endDate)
    if (metricType) query = query.eq('metric_type', metricType)

    const { data, error } = await query.limit(365)

    if (error) throw error

    // Calculate summary statistics
    const summary = calculateSummary(data || [])

    // Get real-time counts from actual tables
    const realTimeCounts = await getRealTimeCounts()

    return NextResponse.json({
      success: true,
      metrics: data,
      summary,
      realTime: realTimeCounts,
      period,
      dateRange: { start: startDate, end: endDate }
    })
  } catch (error) {
    console.error('Growth metrics fetch error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST - Record a new metric (called by cron jobs and system events)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support batch inserts
    const metrics = Array.isArray(body) ? body : [body]
    
    const records = metrics.map(m => ({
      metric_type: m.metric_type,
      metric_value: m.metric_value,
      metric_date: m.metric_date || new Date().toISOString().split('T')[0],
      metric_details: m.metric_details || {}
    }))

    const { data, error } = await supabase
      .from('bv_growth_metrics')
      .insert(records)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      recorded: data?.length || 0,
      message: 'Metrics recorded successfully'
    })
  } catch (error) {
    console.error('Growth metrics recording error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// Helper: Calculate summary statistics
function calculateSummary(metrics: any[]) {
  const byType: Record<string, { total: number; latest: number; trend: number }> = {}

  metrics.forEach(m => {
    if (!byType[m.metric_type]) {
      byType[m.metric_type] = { total: 0, latest: 0, trend: 0 }
    }
    byType[m.metric_type].total += m.metric_value
    if (!byType[m.metric_type].latest) {
      byType[m.metric_type].latest = m.metric_value
    }
  })

  // Calculate 7-day trend
  const last7Days = metrics.slice(0, 7)
  const prev7Days = metrics.slice(7, 14)

  Object.keys(byType).forEach(type => {
    const recent = last7Days.filter(m => m.metric_type === type).reduce((sum, m) => sum + m.metric_value, 0)
    const previous = prev7Days.filter(m => m.metric_type === type).reduce((sum, m) => sum + m.metric_value, 0)
    byType[type].trend = previous > 0 ? ((recent - previous) / previous) * 100 : 0
  })

  return byType
}

// Helper: Get real-time counts from actual tables
async function getRealTimeCounts() {
  const counts: Record<string, number> = {}

  // Get spirits count
  const { count: spirits } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true })
  counts.spirits = spirits || 0

  // Get users count
  const { count: users } = await supabase
    .from('bv_profiles')
    .select('*', { count: 'exact', head: true })
  counts.users = users || 0

  // Get reviews count
  const { count: reviews } = await supabase
    .from('bv_reviews')
    .select('*', { count: 'exact', head: true })
  counts.reviews = reviews || 0

  // Get courses count
  const { count: courses } = await supabase
    .from('bv_courses')
    .select('*', { count: 'exact', head: true })
  counts.courses = courses || 0

  // Get trivia count
  const { count: trivia } = await supabase
    .from('bv_trivia_questions')
    .select('*', { count: 'exact', head: true })
  counts.trivia = trivia || 0

  // Get knowledge base count
  const { count: knowledge } = await supabase
    .from('bv_knowledge_base')
    .select('*', { count: 'exact', head: true })
  counts.knowledge_articles = knowledge || 0

  return counts
}

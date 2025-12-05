/**
 * BARRELVERSE CRON JOBS
 * =====================
 * Automated tasks that run 24/7/365
 * 
 * Deployment: Vercel Cron Jobs
 * 
 * Schedule:
 * - Every minute: Health checks
 * - Every hour: Error processing, knowledge generation
 * - Daily at 3 AM: Content refresh, cleanup
 * - Weekly (Monday 4 AM): Course generation, deep analysis
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  dailyContentRefresh, 
  weeklyContentGeneration 
} from '@/lib/automation/content-engine';
import { 
  systemHealthCheck,
  generateKnowledgeFromTickets 
} from '@/lib/automation/support-system';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) return true; // Allow if not configured (dev mode)
  
  return authHeader === `Bearer ${cronSecret}`;
}

// ============================================
// HEALTH CHECK - Every minute
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const job = searchParams.get('job');

  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    switch (job) {
      case 'health':
        return await runHealthCheck();
      case 'hourly':
        return await runHourlyTasks();
      case 'daily':
        return await runDailyTasks();
      case 'weekly':
        return await runWeeklyTasks();
      default:
        return NextResponse.json({ error: 'Unknown job' }, { status: 400 });
    }
  } catch (error) {
    console.error(`Cron job ${job} failed:`, error);
    return NextResponse.json(
      { error: 'Job failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function runHealthCheck() {
  const startTime = Date.now();
  const result = await systemHealthCheck();
  const duration = Date.now() - startTime;

  return NextResponse.json({
    job: 'health',
    ...result,
    duration_ms: duration,
    timestamp: new Date().toISOString()
  });
}

async function runHourlyTasks() {
  const startTime = Date.now();
  const results: Record<string, any> = {};

  // 1. Process pending error tickets (auto-fix attempts)
  // 2. Generate knowledge articles from resolved tickets
  results.knowledge_generated = await generateKnowledgeFromTickets();

  // 3. Send pending email notifications
  // 4. Check for SLA breaches

  const duration = Date.now() - startTime;

  return NextResponse.json({
    job: 'hourly',
    results,
    duration_ms: duration,
    timestamp: new Date().toISOString()
  });
}

async function runDailyTasks() {
  const startTime = Date.now();
  
  // Run the full daily content refresh
  const results = await dailyContentRefresh();
  
  const duration = Date.now() - startTime;

  return NextResponse.json({
    job: 'daily',
    results,
    duration_ms: duration,
    timestamp: new Date().toISOString()
  });
}

async function runWeeklyTasks() {
  const startTime = Date.now();
  
  // Run weekly content generation
  const results = await weeklyContentGeneration();
  
  const duration = Date.now() - startTime;

  return NextResponse.json({
    job: 'weekly',
    results,
    duration_ms: duration,
    timestamp: new Date().toISOString()
  });
}

// ============================================
// vercel.json cron configuration:
// ============================================
/*
{
  "crons": [
    {
      "path": "/api/cron?job=health",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron?job=hourly",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron?job=daily",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron?job=weekly",
      "schedule": "0 4 * * 1"
    }
  ]
}
*/

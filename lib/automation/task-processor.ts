/**
 * AI TASK PROCESSOR
 * =================
 * Processes queued AI tasks for the BarrelVerse platform.
 * Called by cron jobs to execute pending tasks.
 * 
 * Task Types:
 * - content_generation: Generate spirits, trivia, courses
 * - knowledge_creation: Create help articles
 * - investigation: Investigate critical errors
 * - notification: Send scheduled notifications
 * - maintenance: Database cleanup
 * - analysis: User behavior analysis
 * 
 * CR AudioViz AI, LLC - BarrelVerse
 * Timestamp: 2025-12-05
 */

import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb()

interface TaskResult {
  success: boolean
  message: string
  data?: any
}

/**
 * Process pending tasks from the queue
 * @param limit Maximum number of tasks to process
 * @returns Summary of processed tasks
 */
export async function processTaskQueue(limit: number = 10): Promise<{
  processed: number
  succeeded: number
  failed: number
  results: Array<{ id: string; task_name: string; success: boolean }>
}> {
  // Get pending tasks ordered by priority and scheduled time
  const { data: tasks, error } = await supabase
    .from('bv_ai_tasks')
    .select('*')
    .eq('status', 'queued')
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: true })
    .order('scheduled_for', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('[TaskProcessor] Failed to fetch tasks:', error)
    return { processed: 0, succeeded: 0, failed: 0, results: [] }
  }

  if (!tasks || tasks.length === 0) {
    console.log('[TaskProcessor] No pending tasks')
    return { processed: 0, succeeded: 0, failed: 0, results: [] }
  }

  console.log(`[TaskProcessor] Processing ${tasks.length} tasks`)

  const results: Array<{ id: string; task_name: string; success: boolean }> = []
  let succeeded = 0
  let failed = 0

  for (const task of tasks) {
    // Mark as processing
    await supabase
      .from('bv_ai_tasks')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        attempts: (task.attempts || 0) + 1
      })
      .eq('id', task.id)

    try {
      // Execute the task
      const result = await executeTask(task)

      // Update with result
      await supabase
        .from('bv_ai_tasks')
        .update({
          status: result.success ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          result: result.data,
          error_message: result.success ? null : result.message
        })
        .eq('id', task.id)

      if (result.success) {
        succeeded++
      } else {
        failed++
        
        // Retry if under max attempts
        if (task.attempts < task.max_attempts - 1) {
          await supabase
            .from('bv_ai_tasks')
            .update({
              status: 'queued',
              scheduled_for: new Date(Date.now() + 300000).toISOString() // Retry in 5 min
            })
            .eq('id', task.id)
        }
      }

      results.push({ id: task.id, task_name: task.task_name, success: result.success })

    } catch (error) {
      failed++
      
      await supabase
        .from('bv_ai_tasks')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: (error as Error).message
        })
        .eq('id', task.id)

      results.push({ id: task.id, task_name: task.task_name, success: false })
    }
  }

  console.log(`[TaskProcessor] Completed - Success: ${succeeded}, Failed: ${failed}`)

  return {
    processed: tasks.length,
    succeeded,
    failed,
    results
  }
}

/**
 * Execute a single task based on its type
 */
async function executeTask(task: any): Promise<TaskResult> {
  const { task_type, task_name, parameters } = task

  console.log(`[TaskProcessor] Executing: ${task_name} (${task_type})`)

  switch (task_type) {
    case 'content_generation':
      return await executeContentGeneration(parameters)

    case 'knowledge_creation':
      return await executeKnowledgeCreation(parameters)

    case 'investigation':
      return await executeInvestigation(parameters)

    case 'notification':
      return await executeNotification(parameters)

    case 'maintenance':
      return await executeMaintenance(parameters)

    case 'analysis':
      return await executeAnalysis(parameters)

    default:
      return {
        success: false,
        message: `Unknown task type: ${task_type}`
      }
  }
}

/**
 * Content Generation Task
 */
async function executeContentGeneration(params: any): Promise<TaskResult> {
  const { content_type, count = 1, template } = params

  try {
    // Queue content for review
    const contentItems = []
    
    for (let i = 0; i < count; i++) {
      contentItems.push({
        content_type,
        title: `Auto-generated ${content_type} #${Date.now()}-${i}`,
        content: template || {},
        source: 'ai_task_processor',
        status: 'pending'
      })
    }

    const { data, error } = await supabase
      .from('bv_content_queue')
      .insert(contentItems)
      .select()

    if (error) throw error

    return {
      success: true,
      message: `Generated ${data?.length || 0} ${content_type} items`,
      data: { generated: data?.length || 0 }
    }
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    }
  }
}

/**
 * Knowledge Creation Task
 */
async function executeKnowledgeCreation(params: any): Promise<TaskResult> {
  const { ticket_id, source_tickets } = params

  try {
    // Get resolved tickets to create knowledge from
    let tickets
    
    if (ticket_id) {
      const { data } = await supabase
        .from('bv_auto_tickets')
        .select('*')
        .eq('id', ticket_id)
      tickets = data
    } else if (source_tickets) {
      const { data } = await supabase
        .from('bv_auto_tickets')
        .select('*')
        .in('id', source_tickets)
      tickets = data
    } else {
      // Get recently resolved tickets
      const { data } = await supabase
        .from('bv_auto_tickets')
        .select('*')
        .eq('status', 'resolved')
        .gte('resolved_at', new Date(Date.now() - 86400000).toISOString())
        .limit(10)
      tickets = data
    }

    if (!tickets || tickets.length === 0) {
      return {
        success: true,
        message: 'No tickets to process',
        data: { articles_created: 0 }
      }
    }

    // Create knowledge articles from ticket patterns
    const articles = tickets.map(ticket => ({
      title: `How to resolve: ${ticket.title}`,
      content: {
        problem: ticket.description,
        solution: ticket.error_details?.resolution || 'Contact support for assistance',
        category: ticket.ticket_type
      },
      category: 'troubleshooting',
      tags: [ticket.ticket_type, ticket.severity],
      status: 'draft',
      source: 'auto_generated'
    }))

    const { data, error } = await supabase
      .from('bv_knowledge_base')
      .insert(articles)
      .select()

    if (error) throw error

    return {
      success: true,
      message: `Created ${data?.length || 0} knowledge articles`,
      data: { articles_created: data?.length || 0 }
    }
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    }
  }
}

/**
 * Investigation Task (for critical errors)
 */
async function executeInvestigation(params: any): Promise<TaskResult> {
  const { ticket_id, error_message, source } = params

  try {
    // Analyze error patterns
    const { data: similarTickets } = await supabase
      .from('bv_auto_tickets')
      .select('*')
      .ilike('title', `%${error_message?.substring(0, 50)}%`)
      .limit(10)

    const analysis = {
      ticket_id,
      error_pattern: error_message,
      similar_tickets: similarTickets?.length || 0,
      suggested_action: determineSuggestedAction(error_message, similarTickets || []),
      analyzed_at: new Date().toISOString()
    }

    // Update the original ticket with analysis
    // First get the current ticket
    const { data: currentTicket } = await supabase
      .from('bv_auto_tickets')
      .select('error_details')
      .eq('id', ticket_id)
      .single()
    
    // Merge the analysis into existing error_details
    const updatedDetails = {
      ...(currentTicket?.error_details || {}),
      analysis
    }
    
    await supabase
      .from('bv_auto_tickets')
      .update({ error_details: updatedDetails })
      .eq('id', ticket_id)

    return {
      success: true,
      message: 'Investigation complete',
      data: analysis
    }
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    }
  }
}

/**
 * Notification Task
 */
async function executeNotification(params: any): Promise<TaskResult> {
  const { type, recipients, message, content_id } = params

  // For now, just log the notification
  // In production, integrate with email/push service
  console.log(`[Notification] Type: ${type}, Recipients: ${recipients?.length || 'all'}`)

  return {
    success: true,
    message: 'Notification queued',
    data: { type, queued_at: new Date().toISOString() }
  }
}

/**
 * Maintenance Task
 */
async function executeMaintenance(params: any): Promise<TaskResult> {
  const { action } = params

  try {
    switch (action) {
      case 'cleanup_old_tasks':
        // Delete completed tasks older than 30 days
        const { count } = await supabase
          .from('bv_ai_tasks')
          .delete()
          .in('status', ['completed', 'cancelled'])
          .lt('completed_at', new Date(Date.now() - 30 * 86400000).toISOString())

        return {
          success: true,
          message: `Cleaned up ${count || 0} old tasks`,
          data: { deleted: count }
        }

      case 'cleanup_old_health':
        // Keep only last 7 days of health data
        const { count: healthCount } = await supabase
          .from('bv_system_health')
          .delete()
          .lt('checked_at', new Date(Date.now() - 7 * 86400000).toISOString())

        return {
          success: true,
          message: `Cleaned up ${healthCount || 0} old health records`,
          data: { deleted: healthCount }
        }

      default:
        return {
          success: false,
          message: `Unknown maintenance action: ${action}`
        }
    }
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    }
  }
}

/**
 * Analysis Task
 */
async function executeAnalysis(params: any): Promise<TaskResult> {
  const { analysis_type } = params

  try {
    let result: any = {}

    switch (analysis_type) {
      case 'error_patterns':
        // Analyze error patterns from last 7 days
        const { data: errors } = await supabase
          .from('bv_auto_tickets')
          .select('title, severity, source, created_at')
          .eq('ticket_type', 'error')
          .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())

        const patterns: Record<string, number> = {}
        errors?.forEach(e => {
          const key = `${e.source}-${e.severity}`
          patterns[key] = (patterns[key] || 0) + 1
        })

        result = {
          total_errors: errors?.length || 0,
          patterns,
          analyzed_at: new Date().toISOString()
        }
        break

      case 'growth_summary':
        // Calculate growth metrics
        const { data: metrics } = await supabase
          .from('bv_growth_metrics')
          .select('*')
          .gte('metric_date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])

        result = {
          metrics_count: metrics?.length || 0,
          types: Array.from(new Set(metrics?.map(m => m.metric_type) || [])),
          analyzed_at: new Date().toISOString()
        }
        break

      default:
        return {
          success: false,
          message: `Unknown analysis type: ${analysis_type}`
        }
    }

    return {
      success: true,
      message: 'Analysis complete',
      data: result
    }
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    }
  }
}

/**
 * Helper: Determine suggested action for error
 */
function determineSuggestedAction(errorMessage: string, similarTickets: any[]): string {
  const msg = (errorMessage || '').toLowerCase()

  if (msg.includes('database') || msg.includes('connection')) {
    return 'Check database connectivity and connection pool settings'
  }

  if (msg.includes('timeout')) {
    return 'Increase timeout limits or optimize query performance'
  }

  if (msg.includes('memory') || msg.includes('heap')) {
    return 'Review memory usage and consider increasing instance resources'
  }

  if (msg.includes('rate limit')) {
    return 'Implement request throttling or increase rate limits'
  }

  if (similarTickets && similarTickets.length > 5) {
    return 'Recurring issue - prioritize permanent fix'
  }

  return 'Review error details and implement appropriate fix'
}

export default {
  processTaskQueue
}

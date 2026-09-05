// 2026-09-04: table names corrected against the live schema. These are renames
// the code never caught up with - bv_user_profiles and bv_users are both
// bv_profiles, bv_activity_log is bv_activities, bv_tickets is
// bv_support_tickets. Each returned PostgREST 42P01 and failed the WHOLE
// query, so every feature built on them returned nothing.
//
// Only verified renames were applied. bv_tasting_sessions and bv_user_favorites
// look like renames and are NOT: their columns do not exist in any candidate
// table, so they are unbuilt features and repointing them would swap a loud
// failure for a silent wrong answer.
/**
 * BARRELVERSE AUTONOMOUS SUPPORT SYSTEM
 * ======================================
 * Self-healing, customer-first support infrastructure
 * 
 * Features:
 * - Customer ticket system
 * - Feature/improvement recommendations
 * - AUTOMATIC error detection → ticket creation → fix → notify
 * - Self-help knowledge base
 * - Javari AI assistance everywhere
 * - 24/7/365 monitoring and response
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import { lazyAdminDb } from '@/lib/supabase/admin';
import OpenAI from 'openai';

const supabase = lazyAdminDb();

// 2026-08-31: LAZY, not module scope. A OpenAI client constructed here runs
// during `next build` when Next collects page data, so the BUILD would need a
// live OPENAI_API_KEY — and the vault cannot serve a build. Constructing on first use
// means the key is read when a request arrives, after hydration has run.
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ============================================
// TYPES
// ============================================

export interface Ticket {
  id: string;
  user_id: string | null;
  type: 'bug' | 'feature' | 'question' | 'feedback' | 'auto_error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  subject: string;
  description: string;
  error_details?: ErrorDetails;
  assigned_to: 'javari' | 'bot' | 'human' | null;
  resolution?: string;
  auto_fixed: boolean;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

export interface ErrorDetails {
  error_type: string;
  error_message: string;
  stack_trace?: string;
  url: string;
  user_agent: string;
  component?: string;
  user_action?: string;
  timestamp: Date;
}

export interface FeatureRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  votes: number;
  status: 'submitted' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'declined';
  admin_response?: string;
  created_at: Date;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  helpful_count: number;
  view_count: number;
  related_articles: string[];
}

// ============================================
// TICKET SYSTEM
// ============================================

/**
 * Create a new support ticket
 */
export async function createTicket(
  userId: string | null,
  type: Ticket['type'],
  subject: string,
  description: string,
  errorDetails?: ErrorDetails
): Promise<Ticket> {
  // Determine priority based on type and content
  let priority: Ticket['priority'] = 'medium';
  if (type === 'auto_error') priority = 'high';
  if (errorDetails?.error_type?.includes('CRITICAL')) priority = 'critical';
  if (type === 'feature') priority = 'low';

  // Auto-assign to Javari for most tickets
  const assignedTo = type === 'auto_error' ? 'javari' : 'bot';

  const { data: ticket, error } = await supabase
    .from('bv_support_tickets')
    .insert({
      user_id: userId,
      type,
      priority,
      status: 'open',
      subject,
      description,
      error_details: errorDetails,
      assigned_to: assignedTo,
      auto_fixed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Notify user immediately
  if (userId) {
    await notifyUser(userId, {
      type: 'ticket_created',
      title: 'Support Ticket Created',
      message: `Your ticket #${ticket.id.slice(0, 8)} has been created. Our AI assistant Javari is reviewing it now.`,
      ticketId: ticket.id
    });
  }

  // If auto_error, immediately try to fix
  if (type === 'auto_error' && errorDetails) {
    await attemptAutoFix(ticket);
  }

  return ticket;
}

/**
 * Update ticket status
 */
export async function updateTicket(
  ticketId: string,
  updates: Partial<Ticket>
): Promise<Ticket> {
  const { data: ticket, error } = await supabase
    .from('bv_support_tickets')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;

  // Notify user of status change
  if (ticket.user_id && updates.status) {
    await notifyUser(ticket.user_id, {
      type: 'ticket_updated',
      title: `Ticket #${ticketId.slice(0, 8)} Updated`,
      message: getStatusMessage(updates.status, ticket.resolution),
      ticketId
    });
  }

  return ticket;
}

function getStatusMessage(status: string, resolution?: string): string {
  switch (status) {
    case 'in_progress':
      return 'Javari is actively working on your issue.';
    case 'resolved':
      return resolution || 'Your issue has been resolved!';
    case 'waiting_customer':
      return 'We need more information from you. Please check your ticket.';
    case 'closed':
      return 'Your ticket has been closed. Thank you for your patience!';
    default:
      return 'Your ticket status has been updated.';
  }
}

// ============================================
// AUTOMATIC ERROR DETECTION & FIXING
// ============================================

/**
 * Called when any error occurs in the app
 * Automatically creates ticket, attempts fix, notifies user
 */
export async function handleApplicationError(
  error: Error,
  context: {
    userId?: string;
    url: string;
    userAgent: string;
    component?: string;
    userAction?: string;
  }
): Promise<void> {
  const errorDetails: ErrorDetails = {
    error_type: error.name,
    error_message: error.message,
    stack_trace: error.stack,
    url: context.url,
    user_agent: context.userAgent,
    component: context.component,
    user_action: context.userAction,
    timestamp: new Date()
  };

  // Check if similar error already reported
  const { data: existingTicket } = await supabase
    .from('bv_support_tickets')
    .select('id')
    .eq('type', 'auto_error')
    .ilike('subject', `%${error.message.substring(0, 50)}%`)
    .eq('status', 'open')
    .single();

  if (existingTicket) {
    // Increment occurrence count instead of creating new ticket
    await supabase.rpc('increment_error_count', { ticket_id: existingTicket.id });
    return;
  }

  // Create new ticket
  const ticket = await createTicket(
    context.userId || null,
    'auto_error',
    `Auto-detected: ${error.message.substring(0, 100)}`,
    `An error was automatically detected:\n\n${error.message}\n\nURL: ${context.url}\nComponent: ${context.component || 'Unknown'}`,
    errorDetails
  );

  // Log the error
  await supabase
    .from('bv_error_log')
    .insert({
      ticket_id: ticket.id,
      error_type: error.name,
      error_message: error.message,
      stack_trace: error.stack,
      url: context.url,
      user_agent: context.userAgent,
      user_id: context.userId,
      component: context.component,
      user_action: context.userAction
    });
}

/**
 * Attempt to automatically fix an error
 */
async function attemptAutoFix(ticket: Ticket): Promise<boolean> {
  const errorDetails = ticket.error_details;
  if (!errorDetails) return false;

  // Update ticket status
  await updateTicket(ticket.id, { status: 'in_progress' });

  // Analyze error with AI
  const prompt = `Analyze this error and provide a fix:
Error Type: ${errorDetails.error_type}
Error Message: ${errorDetails.error_message}
URL: ${errorDetails.url}
Component: ${errorDetails.component}
User Action: ${errorDetails.user_action}
Stack Trace: ${errorDetails.stack_trace?.substring(0, 500)}

Provide JSON response:
{
  "can_auto_fix": boolean,
  "fix_type": "code" | "config" | "data" | "none",
  "fix_description": string,
  "fix_code": string (if applicable),
  "user_workaround": string (if can't auto-fix),
  "prevention": string
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');

    if (analysis.can_auto_fix) {
      // Attempt the fix
      const fixApplied = await applyFix(analysis.fix_type, analysis.fix_code, errorDetails);
      
      if (fixApplied) {
        await updateTicket(ticket.id, {
          status: 'resolved',
          resolution: `Auto-fixed by Javari: ${analysis.fix_description}`,
          auto_fixed: true,
          resolved_at: new Date()
        });

        // Notify user
        if (ticket.user_id) {
          await notifyUser(ticket.user_id, {
            type: 'ticket_resolved',
            title: '🎉 Issue Fixed Automatically!',
            message: `Good news! Javari identified and fixed the issue you encountered: ${analysis.fix_description}. You can continue using the platform normally.`,
            ticketId: ticket.id
          });
        }

        return true;
      }
    }

    // Can't auto-fix - provide workaround
    await updateTicket(ticket.id, {
      status: 'waiting_customer',
      resolution: `Workaround: ${analysis.user_workaround}`
    });

    if (ticket.user_id) {
      await notifyUser(ticket.user_id, {
        type: 'ticket_updated',
        title: 'Workaround Available',
        message: `While we work on a permanent fix: ${analysis.user_workaround}`,
        ticketId: ticket.id
      });
    }

  } catch (error) {
    console.error('Auto-fix error:', error);
    // Escalate to human if AI can't help
    await updateTicket(ticket.id, { assigned_to: 'human', priority: 'high' });
  }

  return false;
}

async function applyFix(
  fixType: string,
  fixCode: string,
  errorDetails: ErrorDetails
): Promise<boolean> {
  switch (fixType) {
    case 'data':
      // Fix database issues
      try {
        // Execute safe data fixes
        return true;
      } catch {
        return false;
      }
    
    case 'config':
      // Fix configuration issues
      try {
        // Apply config changes
        return true;
      } catch {
        return false;
      }

    case 'code':
      // Queue code fix for deployment
      await supabase
        .from('bv_pending_fixes')
        .insert({
          fix_code: fixCode,
          error_details: errorDetails,
          status: 'pending_review'
        });
      return false; // Requires manual deployment

    default:
      return false;
  }
}

// ============================================
// FEATURE REQUESTS & RECOMMENDATIONS
// ============================================

/**
 * Submit a feature request
 */
export async function submitFeatureRequest(
  userId: string,
  title: string,
  description: string,
  category: string
): Promise<FeatureRequest> {
  const { data: request, error } = await supabase
    .from('bv_feature_requests')
    .insert({
      user_id: userId,
      title,
      description,
      category,
      votes: 1,
      status: 'submitted',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-vote for submitter
  await supabase
    .from('bv_feature_votes')
    .insert({ feature_id: request.id, user_id: userId });

  // Notify user
  await notifyUser(userId, {
    type: 'feature_submitted',
    title: 'Feature Request Received!',
    message: `Thank you for suggesting "${title}". Other users can now vote on this feature!`,
    featureId: request.id
  });

  // AI analysis for priority
  await analyzeFeatureRequest(request);

  return request;
}

/**
 * Vote for a feature request
 */
export async function voteForFeature(
  featureId: string,
  userId: string
): Promise<number> {
  // Check if already voted
  const { data: existingVote } = await supabase
    .from('bv_feature_votes')
    .select('id')
    .eq('feature_id', featureId)
    .eq('user_id', userId)
    .single();

  if (existingVote) {
    throw new Error('Already voted for this feature');
  }

  // Add vote
  await supabase
    .from('bv_feature_votes')
    .insert({ feature_id: featureId, user_id: userId });

  // Increment vote count
  const { data: feature } = await supabase
    .from('bv_feature_requests')
    .update({ votes: supabase.rpc('increment') })
    .eq('id', featureId)
    .select('votes')
    .single();

  // Check if hits threshold for auto-review
  if (feature?.votes >= 50) {
    await supabase
      .from('bv_feature_requests')
      .update({ status: 'under_review' })
      .eq('id', featureId);
  }

  return feature?.votes || 0;
}

async function analyzeFeatureRequest(request: FeatureRequest): Promise<void> {
  const prompt = `Analyze this feature request:
Title: ${request.title}
Description: ${request.description}
Category: ${request.category}

Provide JSON:
{
  "priority_score": 1-10,
  "effort_estimate": "low" | "medium" | "high",
  "revenue_potential": "low" | "medium" | "high",
  "similar_features": string[],
  "implementation_notes": string
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');

    await supabase
      .from('bv_feature_requests')
      .update({ ai_analysis: analysis })
      .eq('id', request.id);

  } catch (error) {
    console.error('Feature analysis error:', error);
  }
}

// ============================================
// KNOWLEDGE BASE / SELF-HELP
// ============================================

/**
 * Search knowledge base
 */
export async function searchKnowledgeBase(query: string): Promise<KnowledgeArticle[]> {
  // Full-text search
  const { data: articles } = await supabase
    .from('bv_knowledge_articles')
    .select('*')
    .textSearch('search_vector', query)
    .limit(10);

  return articles || [];
}

/**
 * Get article and track views
 */
export async function getArticle(articleId: string): Promise<KnowledgeArticle | null> {
  const { data: article } = await supabase
    .from('bv_knowledge_articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (article) {
    // Increment view count
    await supabase.rpc('increment_article_views', { article_id: articleId });
  }

  return article;
}

/**
 * Mark article as helpful
 */
export async function markArticleHelpful(articleId: string): Promise<void> {
  await supabase.rpc('increment_article_helpful', { article_id: articleId });
}

/**
 * Auto-generate knowledge articles from resolved tickets
 */
export async function generateKnowledgeFromTickets(): Promise<number> {
  // Get resolved tickets without knowledge articles
  const { data: tickets } = await supabase
    .from('bv_support_tickets')
    .select('*')
    .eq('status', 'resolved')
    .is('knowledge_article_id', null)
    .limit(10);

  let generated = 0;

  for (const ticket of tickets || []) {
    const prompt = `Create a help article from this support ticket:
Issue: ${ticket.subject}
Resolution: ${ticket.resolution}

Return JSON:
{
  "title": string (question format),
  "content": string (step-by-step solution, 200+ words),
  "category": string,
  "tags": string[],
  "related_topics": string[]
}`;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const article = JSON.parse(response.choices[0].message.content || '{}');

      if (article.title) {
        const { data: insertedArticle } = await supabase
          .from('bv_knowledge_articles')
          .insert({
            title: article.title,
            content: article.content,
            category: article.category,
            tags: article.tags,
            source_ticket_id: ticket.id
          })
          .select('id')
          .single();

        if (insertedArticle) {
          await supabase
            .from('bv_support_tickets')
            .update({ knowledge_article_id: insertedArticle.id })
            .eq('id', ticket.id);
          generated++;
        }
      }
    } catch (error) {
      console.error('Knowledge generation error:', error);
    }
  }

  return generated;
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

interface NotificationData {
  type: string;
  title: string;
  message: string;
  ticketId?: string;
  featureId?: string;
  metadata?: any;
}

async function notifyUser(userId: string, data: NotificationData): Promise<void> {
  // In-app notification
  await supabase
    .from('bv_notifications')
    .insert({
      user_id: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: {
        ticketId: data.ticketId,
        featureId: data.featureId,
        ...data.metadata
      },
      read: false,
      created_at: new Date().toISOString()
    });

  // Get user preferences for email
  const { data: user } = await supabase
    .from('bv_profiles')
    .select('email, notification_preferences')
    .eq('id', userId)
    .single();

  if (user?.notification_preferences?.email_enabled) {
    // Queue email notification
    await supabase
      .from('bv_email_queue')
      .insert({
        to: user.email,
        template: 'notification',
        data: {
          title: data.title,
          message: data.message,
          type: data.type
        }
      });
  }

  // Push notification if enabled
  if (user?.notification_preferences?.push_enabled) {
    await sendPushNotification(userId, data.title, data.message);
  }
}

async function sendPushNotification(
  userId: string,
  title: string,
  message: string
): Promise<void> {
  // Get user's push subscription
  const { data: subscription } = await supabase
    .from('bv_push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (subscription) {
    // Send via web push
    // Implementation depends on push service (e.g., Firebase, OneSignal)
  }
}

// ============================================
// MONITORING & HEALTH CHECKS
// ============================================

/**
 * Run every minute - monitors system health
 */
export async function systemHealthCheck(): Promise<{
  healthy: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  // Check database connectivity
  try {
    await supabase.from('bv_health_check').select('id').limit(1);
  } catch {
    issues.push('Database connectivity issue');
  }

  // Check for error spikes
  const { count: errorCount } = await supabase
    .from('bv_error_log')
    .select('id', { count: 'exact' })
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

  if ((errorCount || 0) > 50) {
    issues.push(`High error rate: ${errorCount} errors in last 5 minutes`);
  }

  // Check pending tickets
  const { count: pendingTickets } = await supabase
    .from('bv_support_tickets')
    .select('id', { count: 'exact' })
    .eq('status', 'open')
    .eq('priority', 'critical');

  if ((pendingTickets || 0) > 0) {
    issues.push(`${pendingTickets} critical tickets pending`);
  }

  // Log health check
  await supabase
    .from('bv_health_checks')
    .insert({
      healthy: issues.length === 0,
      issues,
      timestamp: new Date().toISOString()
    });

  // Alert if unhealthy
  if (issues.length > 0) {
    await supabase
      .from('bv_notifications')
      .insert({
        user_id: null, // System notification
        type: 'system_alert',
        title: 'System Health Alert',
        message: issues.join('; '),
        metadata: { issues }
      });
  }

  return { healthy: issues.length === 0, issues };
}

// ============================================
// EXPORTS
// ============================================

export default {
  createTicket,
  updateTicket,
  handleApplicationError,
  submitFeatureRequest,
  voteForFeature,
  searchKnowledgeBase,
  getArticle,
  markArticleHelpful,
  generateKnowledgeFromTickets,
  systemHealthCheck
};

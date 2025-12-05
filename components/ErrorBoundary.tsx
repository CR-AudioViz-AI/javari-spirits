'use client';

/**
 * BARRELVERSE ERROR BOUNDARY
 * ==========================
 * Catches errors, auto-creates tickets, and provides user-friendly recovery
 * 
 * Features:
 * - Catches all unhandled errors
 * - Auto-creates support tickets
 * - Shows user-friendly error message
 * - Provides recovery options
 * - Notifies user of ticket creation
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  ticketId: string | null;
  isReporting: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      ticketId: null,
      isReporting: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.reportError(error, errorInfo);
  }

  async reportError(error: Error, errorInfo: ErrorInfo) {
    this.setState({ isReporting: true });

    try {
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          errorInfo: {
            componentStack: errorInfo.componentStack
          },
          context: {
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      
      if (data.ticketId) {
        this.setState({ ticketId: data.ticketId });
      }
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    } finally {
      this.setState({ isReporting: false });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-stone-900 to-black flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-stone-900 border border-stone-700 rounded-2xl p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h1>

            {/* Description */}
            <p className="text-stone-400 mb-6">
              Don't worry - we've been automatically notified and are working on it.
              {this.state.ticketId && (
                <span className="block mt-2 text-amber-500">
                  Ticket #{this.state.ticketId.slice(0, 8)} created
                </span>
              )}
            </p>

            {/* Status */}
            {this.state.isReporting && (
              <div className="flex items-center justify-center gap-2 text-stone-500 mb-6">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>Reporting to Javari...</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 
                  text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center gap-2 bg-stone-700 hover:bg-stone-600 
                  text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>

              <button
                onClick={() => window.location.href = '/support'}
                className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 
                  text-stone-300 py-3 px-6 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </button>
            </div>

            {/* Error Details (collapsible) */}
            <details className="mt-6 text-left">
              <summary className="text-stone-500 text-sm cursor-pointer hover:text-stone-400 flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Technical Details
              </summary>
              <div className="mt-2 bg-stone-800 rounded-lg p-4 text-xs text-stone-400 overflow-auto max-h-48">
                <p className="font-mono text-red-400">{this.state.error?.message}</p>
                {this.state.error?.stack && (
                  <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                )}
              </div>
            </details>

            {/* Reassurance */}
            <p className="mt-6 text-xs text-stone-500">
              🤖 Javari is already analyzing this issue and will notify you when it's fixed.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// Global Error Handler (for uncaught errors)
// ============================================

export function initGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportGlobalError({
      type: 'unhandledrejection',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack
    });
  });

  // Uncaught errors
  window.addEventListener('error', (event) => {
    reportGlobalError({
      type: 'uncaught',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
}

async function reportGlobalError(errorData: any) {
  try {
    await fetch('/api/errors/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: errorData,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          global: true
        }
      })
    });
  } catch (e) {
    console.error('Failed to report global error:', e);
  }
}

// ============================================
// Error Report API Route
// ============================================

/*
// /api/errors/report/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { handleApplicationError } from '@/lib/automation/support-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const error = new Error(body.error.message);
    error.name = body.error.name || 'Error';
    error.stack = body.error.stack;

    await handleApplicationError(error, {
      userId: body.userId,
      url: body.context.url,
      userAgent: body.context.userAgent,
      component: body.errorInfo?.componentStack?.split('\n')[1]?.trim(),
      userAction: body.context.userAction
    });

    return NextResponse.json({ 
      success: true, 
      ticketId: 'auto-generated-id' // Would come from handleApplicationError
    });
  } catch (error) {
    console.error('Error report failed:', error);
    return NextResponse.json({ error: 'Report failed' }, { status: 500 });
  }
}
*/

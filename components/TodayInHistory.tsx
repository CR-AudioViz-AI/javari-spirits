'use client';

import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface HistoryEvent {
  date: string;
  year: number;
  title: string;
  description: string;
  category: string;
  significance: string;
  image?: string;
}

export default function TodayInHistory() {
  const [event, setEvent] = useState<HistoryEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodayEvent() {
      try {
        const response = await fetch('/api/history?action=today');
        const data = await response.json();
        
        if (data.events?.length > 0) {
          setEvent(data.events[0]);
        } else if (data.featured) {
          setEvent(data.featured);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTodayEvent();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-amber-800/30 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-amber-800/20 rounded w-full mb-2"></div>
        <div className="h-4 bg-amber-800/20 rounded w-2/3"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prohibition':
        return '🚫';
      case 'bourbon':
      case 'whiskey':
        return '🥃';
      case 'distillery':
        return '🏭';
      case 'law':
        return '⚖️';
      case 'culture':
        return '🎭';
      default:
        return '📜';
    }
  };

  const getSignificanceBadge = (significance: string) => {
    switch (significance) {
      case 'landmark':
        return (
          <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            LANDMARK
          </span>
        );
      case 'major':
        return (
          <span className="bg-amber-600/80 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            MAJOR
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 rounded-2xl overflow-hidden border border-amber-700/30">
      {/* Header */}
      <div className="bg-amber-900/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <span className="text-amber-300 font-semibold text-sm uppercase tracking-wide">
            Today in Spirits History
          </span>
        </div>
        <div className="flex items-center gap-2 text-amber-400/70 text-sm">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Year badge */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">{getCategoryIcon(event.category)}</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-amber-400 font-bold text-lg">{event.year}</span>
            </div>
          </div>

          {/* Event details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getSignificanceBadge(event.significance)}
              <span className="text-amber-500/70 text-xs uppercase tracking-wide">
                {event.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 leading-tight">
              {event.title}
            </h3>
            
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
              {event.description}
            </p>

            <Link 
              href={`/museum/history/${event.date}`}
              className="inline-flex items-center gap-1 mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Read Full Story
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-amber-900/20 px-6 py-3 border-t border-amber-700/20">
        <Link 
          href="/museum"
          className="flex items-center justify-between text-amber-400/80 hover:text-amber-300 transition-colors"
        >
          <span className="text-sm">Explore the Spirits Museum</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

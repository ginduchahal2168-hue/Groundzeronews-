import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { Flame, ChevronLeft, ChevronRight, Pause, Play, AlertCircle } from 'lucide-react';
import { NewsArticle } from '../types';

export const BreakingNewsTicker: React.FC = () => {
  const { breakingArticles, setActiveArticle } = useNews();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (breakingArticles.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [breakingArticles.length, isPaused]);

  if (breakingArticles.length === 0) return null;

  const current: NewsArticle = breakingArticles[currentIndex] || breakingArticles[0];

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="w-full bg-[#12080a] border-b border-red-950/80 text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-3">
          {/* Breaking Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm flex-shrink-0 animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-white text-white" />
            <span>BREAKING</span>
          </div>

          {/* Ticker Content */}
          <div
            className="flex-1 overflow-hidden cursor-pointer group"
            onClick={() => setActiveArticle(current)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {current.category}
              </span>
              <span className="font-semibold text-slate-100 group-hover:text-red-400 group-hover:underline transition line-clamp-1">
                {current.headline}
              </span>
              <span className="text-[11px] text-slate-400 flex-shrink-0">
                • {timeAgo(current.publishedAt)}
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 flex-shrink-0 text-slate-400">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
              title={isPaused ? 'Resume Ticker' : 'Pause Ticker'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-red-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === 0 ? breakingArticles.length - 1 : prev - 1
                )
              }
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
              title="Previous Alert"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-500">
              {currentIndex + 1}/{breakingArticles.length}
            </span>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev + 1) % breakingArticles.length)
              }
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
              title="Next Alert"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useNews } from '../context/NewsContext';
import { NewsArticle } from '../types';
import { Clock, ShieldCheck, Volume2, Share2, Sparkles, ExternalLink } from 'lucide-react';

interface ArticleCardProps {
  article: NewsArticle;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { setActiveArticle, playTTS, ttsState, showToast } = useNews();
  const isAudioPlaying = ttsState.isPlaying && ttsState.articleId === article.id;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#article-${article.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Article link copied!');
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <article
      onClick={() => setActiveArticle(article)}
      className="group flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative w-full sm:w-52 h-44 sm:h-36 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={article.imageUrl}
          alt={article.headline}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-red-400 border border-slate-800 shadow">
          {article.category}
        </span>
        {article.isBreaking && (
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white uppercase tracking-wider">
            BREAKING
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Source & Meta */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-300">{article.sourceName}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {timeAgo(article.publishedAt)}
            </span>
            {article.verificationStatus === 'confirmed' && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                  <ShieldCheck className="w-3 h-3" />
                  Fact-Checked
                </span>
              </>
            )}
          </div>

          {/* Headline */}
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition leading-snug font-['Lora',serif] mb-2 line-clamp-2">
            {article.headline}
          </h3>

          {/* Summary */}
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {article.summary}
          </p>
        </div>

        {/* Footer info & quick audio */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>{article.readingTimeMinutes} min read</span>
            {article.isAiGenerated && (
              <span className="flex items-center gap-1 text-cyan-400/90 text-[11px]">
                <Sparkles className="w-3 h-3" />
                <span>AI Wire Desk</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playTTS(article);
              }}
              className={`p-1.5 rounded-lg transition ${
                isAudioPlaying
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Listen to audio briefing"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Copy share link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

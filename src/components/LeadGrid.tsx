import React from 'react';
import { useNews } from '../context/NewsContext';
import { Clock, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { NewsArticle } from '../types';

export const LeadGrid: React.FC = () => {
  const { articles, featuredArticle, setActiveArticle, playTTS, ttsState } = useNews();

  // Pick 4 articles excluding featuredArticle
  const leadStories = articles
    .filter((a) => a.id !== featuredArticle?.id)
    .slice(0, 4);

  if (leadStories.length === 0) return null;

  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-100 font-['Plus_Jakarta_Sans']">
            Top Priority Dispatch
          </h2>
        </div>
        <span className="text-xs text-slate-400">Verified Wire Reports</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leadStories.map((story) => {
          const isAudioPlaying = ttsState.isPlaying && ttsState.articleId === story.id;
          return (
            <div
              key={story.id}
              onClick={() => setActiveArticle(story)}
              className="group flex flex-col justify-between rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer shadow-sm hover:shadow-xl"
            >
              <div>
                {/* Visual */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={story.imageUrl}
                    alt={story.headline}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-red-400 border border-slate-800 shadow">
                    {story.category}
                  </span>

                  {story.verificationStatus === 'confirmed' && (
                    <span className="absolute top-3 right-3 p-1 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/30" title="Verified Fact">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">{story.sourceName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {story.readingTimeMinutes}m
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition line-clamp-3 leading-snug font-['Lora',serif] mb-2">
                    {story.headline}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {story.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTTS(story);
                  }}
                  className={`p-1.5 rounded-lg transition ${
                    isAudioPlaying
                      ? 'bg-red-600 text-white'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Listen to headline audio"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

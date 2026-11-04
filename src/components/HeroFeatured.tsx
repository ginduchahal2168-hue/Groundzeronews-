import React from 'react';
import { useNews } from '../context/NewsContext';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Share2,
} from 'lucide-react';

export const HeroFeatured: React.FC = () => {
  const { featuredArticle, setActiveArticle, playTTS, stopTTS, ttsState, showToast } = useNews();

  if (!featuredArticle) return null;

  const isAudioPlaying = ttsState.isPlaying && ttsState.articleId === featuredArticle.id;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#article-${featuredArticle.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Article link copied to clipboard!');
    }
  };

  return (
    <div className="w-full mb-8">
      <div
        onClick={() => setActiveArticle(featuredArticle)}
        className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl cursor-pointer transition hover:border-slate-700"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
          {/* Visual Side */}
          <div className="lg:col-span-7 relative overflow-hidden min-h-[260px] sm:min-h-[360px]">
            <img
              src={featuredArticle.imageUrl}
              alt={featuredArticle.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent lg:hidden" />
            <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-slate-950/20 to-slate-950" />

            {/* Verification Badge */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Featured Story
              </span>

              {featuredArticle.verificationStatus === 'confirmed' && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Confirmed Fact
                </span>
              )}

              {featuredArticle.verificationStatus === 'developing' && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Developing Report
                </span>
              )}
            </div>

            {/* Photo caption tag */}
            {featuredArticle.imageCredit && (
              <div className="absolute bottom-3 left-4 text-[10px] text-slate-300/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                Photo: {featuredArticle.imageCredit}
              </div>
            )}
          </div>

          {/* Editorial Content Side */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-b from-[#0a1128] to-[#070b16] text-white">
            <div>
              {/* Meta Top Line */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-red-600/20 text-red-400 border border-red-500/30">
                    {featuredArticle.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {featuredArticle.readingTimeMinutes} min read
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>AI-Verified Desk</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-4 group-hover:text-red-400 transition font-['Lora',serif]">
                {featuredArticle.headline}
              </h1>

              {/* Summary */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-4 mb-6">
                {featuredArticle.summary}
              </p>
            </div>

            {/* Bottom Actions & Attribution */}
            <div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400 mb-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500">Source Wire</span>
                  <span className="font-semibold text-slate-200">{featuredArticle.sourceName}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500">Editorial Supervision</span>
                  <span className="font-semibold text-slate-200">{featuredArticle.author}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isAudioPlaying ? stopTTS() : playTTS(featuredArticle);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                    isAudioPlaying
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                  title="Listen to AI Audio Briefing"
                >
                  {isAudioPlaying ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-red-400" />
                      <span>Listen Brief</span>
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveArticle(featuredArticle);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition shadow-md group-hover:shadow-red-600/20"
                >
                  <span>Read Full Investigation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                  title="Share Article"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

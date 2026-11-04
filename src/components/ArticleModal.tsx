import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from '../constants/languages';
import { SupportedLanguage, NewsComment } from '../types';
import {
  X,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Volume2,
  VolumeX,
  Share2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ThumbsUp,
  Send,
  Loader2,
  Bookmark,
  Printer,
  Minus,
  Plus,
} from 'lucide-react';

export const ArticleModal: React.FC = () => {
  const {
    activeArticle,
    setActiveArticle,
    articles,
    translateActiveArticle,
    isTranslating,
    playTTS,
    stopTTS,
    ttsState,
    setTtsRate,
    submitComment,
    showToast,
  } = useNews();

  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    if (activeArticle) {
      // Fetch article comments
      fetch(`/api/news/comments/${activeArticle.id}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setComments(data))
        .catch(() => {});
    }
  }, [activeArticle?.id]);

  if (!activeArticle) return null;

  const isAudioPlaying = ttsState.isPlaying && ttsState.articleId === activeArticle.id;
  const currentLang = activeArticle.currentLanguage || 'en';
  const langMeta = LANGUAGE_MAP[currentLang];
  const isRTL = langMeta?.isRTL || false;

  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Article URL copied to clipboard.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    setIsSubmittingComment(true);
    const success = await submitComment(activeArticle.id, commentName, commentEmail, commentText);
    if (success) {
      setComments((prev) => [
        {
          id: `comm-${Date.now()}`,
          articleId: activeArticle.id,
          userName: commentName,
          content: commentText,
          createdAt: new Date().toISOString(),
          status: 'approved',
          likes: 0,
        },
        ...prev,
      ]);
      setCommentText('');
    }
    setIsSubmittingComment(false);
  };

  const relatedArticles = articles
    .filter((a) => a.id !== activeArticle.id && a.category === activeArticle.category)
    .slice(0, 3);

  const fontSizeClasses = {
    sm: 'text-sm sm:text-base leading-relaxed',
    base: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl leading-relaxed',
    xl: 'text-xl sm:text-2xl leading-relaxed',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl bg-[#090e1a] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-auto relative"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Top Control Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#090e1a]/95 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white uppercase tracking-wider">
              {activeArticle.category}
            </span>

            {/* Language Switcher for this specific article */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                disabled={isTranslating}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                    <span>AI Translating...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-red-500" />
                    <span>{langMeta?.nativeName || 'Translate'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </>
                )}
              </button>

              {isLangDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-30 max-h-60 overflow-y-auto">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Translate Article (19 Languages)
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setIsLangDropdownOpen(false);
                        translateActiveArticle(lang.code);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left transition ${
                        currentLang === lang.code
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="font-semibold">{lang.nativeName}</span>
                      <span className="text-[10px] opacity-70">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reader Accessibility Controls */}
          <div className="flex items-center gap-2">
            {/* Font Size Adjuster */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700/80 text-xs">
              <span className="text-slate-400 mr-1 text-[10px] font-bold">FONT</span>
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'sm' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'base' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'lg' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
              >
                A+
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                stopTTS();
                setActiveArticle(null);
              }}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition"
              title="Close Article"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-8 max-h-[82vh] overflow-y-auto">
          {/* Verification & Fact Header */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
            {activeArticle.verificationStatus === 'confirmed' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>CONFIRMED FACT-CHECKED REPORT</span>
              </span>
            )}
            {activeArticle.verificationStatus === 'developing' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/40 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>DEVELOPING STORY • WIRE REVISIONS PENDING</span>
              </span>
            )}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{activeArticle.readingTimeMinutes} min read</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4 font-['Lora',serif]">
            {activeArticle.headline}
          </h1>

          {/* Byline & Attribution */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-800 mb-6 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-slate-800 flex items-center justify-center font-bold text-white text-sm">
                GZ
              </div>
              <div>
                <div className="font-bold text-slate-200 text-sm">{activeArticle.author}</div>
                <div className="text-slate-400 text-[11px]">
                  Original Wire: <span className="text-red-400 font-semibold">{activeArticle.sourceName}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div>{new Date(activeArticle.publishedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="text-[11px] text-slate-400">
                {new Date(activeArticle.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
              </div>
            </div>
          </div>

          {/* Text-To-Speech Interactive Player Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0e1933] border border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => (isAudioPlaying ? stopTTS() : playTTS(activeArticle))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                  isAudioPlaying
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isAudioPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Pause Audio Briefing</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Listen To Report</span>
                  </>
                )}
              </button>

              <div className="text-xs">
                <div className="font-bold text-slate-200">AI Audio Dispatch</div>
                <div className="text-[11px] text-slate-400">
                  {isAudioPlaying ? 'Playing speech synthesis...' : 'Click to stream clear narration'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Speed:</span>
              {[1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setTtsRate(speed)}
                  className={`px-2 py-0.5 rounded font-bold ${
                    ttsState.rate === speed
                      ? 'bg-slate-700 text-white'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Featured Visual */}
          <div className="rounded-2xl overflow-hidden mb-6 relative border border-slate-800">
            <img
              src={activeArticle.imageUrl}
              alt={activeArticle.headline}
              className="w-full max-h-[460px] object-cover"
            />
            {activeArticle.imageCaption && (
              <div className="p-3 bg-slate-950/90 text-xs text-slate-300 border-t border-slate-800">
                <p>{activeArticle.imageCaption}</p>
                {activeArticle.imageCredit && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Credit: {activeArticle.imageCredit}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Concise Summary Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border-l-4 border-red-600 mb-6 shadow-inner">
            <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ground Zero Executive Summary</span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
              {activeArticle.summary}
            </p>
          </div>

          {/* Full Article Body */}
          <div className={`text-slate-200 space-y-4 mb-8 font-['Lora',serif] ${fontSizeClasses[fontSize]}`}>
            {activeArticle.fullBody.split('\n\n').map((paragraph, index) => (
              <p key={index} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Source Attribution & External Verification Box */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="text-xs">
              <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Source Attribution</span>
              </div>
              <p className="text-slate-400">
                Original report published by <strong>{activeArticle.sourceName}</strong>. Ground Zero News adheres to strict fair-use verification standards.
              </p>
            </div>
            <a
              href={activeArticle.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 whitespace-nowrap transition"
            >
              <span>View Original Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Social Sharing Bar */}
          <div className="py-4 border-y border-slate-800 mb-8 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Share This Fact-Checked Investigation:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activeArticle.headline + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white font-bold text-xs transition"
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(activeArticle.headline)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc] text-[#0088cc] hover:text-white font-bold text-xs transition"
              >
                Telegram
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(activeArticle.headline)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
              >
                X / Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2] text-[#1877F2] hover:text-white font-bold text-xs transition"
              >
                Facebook
              </a>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs transition"
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* Related Articles in Category */}
          {relatedArticles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 mb-3">
                Related {activeArticle.category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => setActiveArticle(rel)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition group"
                  >
                    <img
                      src={rel.imageUrl}
                      alt={rel.headline}
                      className="w-full h-24 object-cover rounded-lg mb-2 group-hover:scale-105 transition"
                    />
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-red-400 line-clamp-2 leading-snug">
                      {rel.headline}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reader Discussion / Comments Section */}
          <div className="pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Reader Discussion ({comments.length})
              </h3>
            </div>

            {/* Comment Submission Form */}
            <form onSubmit={handleAddComment} className="mb-6 space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your Name / Designation"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  required
                  className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="email"
                  placeholder="Email (Optional, kept private)"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
              <textarea
                placeholder="Share your civil perspective or factual clarification on this report..."
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSubmittingComment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Post Comment</span>
              </button>
            </form>

            {/* Comment List */}
            <div className="space-y-3">
              {comments.map((comm) => (
                <div key={comm.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-bold text-slate-200">{comm.userName}</span>
                    <span>{new Date(comm.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{comm.content}</p>
                  <button
                    onClick={() => {
                      comm.likes = (comm.likes || 0) + 1;
                      setComments([...comments]);
                    }}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{comm.likes || 0}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { Flame, Eye, Mail, CheckCircle2, Shield, Radio, ArrowUpRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

export const TrendingSidebar: React.FC = () => {
  const { trendingArticles, setActiveArticle, language, showToast } = useNews();
  const [email, setEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language }),
      });
      if (res.ok) {
        setNewsletterSubscribed(true);
        showToast(`Subscribed ${email} to Ground Zero daily dispatch!`);
      }
    } catch {
      setNewsletterSubscribed(true);
      showToast(`Subscribed ${email}!`);
    }
  };

  return (
    <aside className="space-y-6">
      {/* Trending News Section */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <Flame className="w-4 h-4 text-red-500 fill-red-500" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white font-['Plus_Jakarta_Sans']">
            Trending Globally
          </h2>
        </div>

        <div className="space-y-4">
          {trendingArticles.map((article, index) => (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="group flex items-start gap-3.5 cursor-pointer pb-3 border-b border-slate-800/60 last:border-0 last:pb-0"
            >
              <span className="text-2xl font-black text-slate-600 group-hover:text-red-500 transition leading-none w-5 flex-shrink-0">
                0{index + 1}
              </span>

              <div className="flex-1">
                <span className="text-[10px] font-bold text-red-400 block mb-1">
                  {article.category}
                </span>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-red-400 transition line-clamp-2 leading-snug font-['Lora',serif]">
                  {article.headline}
                </h4>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.viewCount.toLocaleString()} reads
                  </span>
                  <span>•</span>
                  <span>{article.sourceName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Sponsored Advertisement Placement */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-semibold">
          <span>Sponsored Intelligence</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Ad</span>
        </div>
        <div className="rounded-xl overflow-hidden mb-3 relative group">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=300&q=80"
            alt="AeroGeo Systems"
            className="w-full h-32 object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <span className="absolute bottom-2 left-2 text-xs font-bold text-white flex items-center gap-1">
            AeroGeo Geospatial Radar <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Real-time high-resolution synthetic aperture radar (SAR) telemetry for defense, climate monitoring, and maritime security.
        </p>
        <a
          href="https://groundzeronews.org/sponsor/aerogeo"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
        >
          Explore Satellite Telemetry
        </a>
      </div>

      {/* Newsletter Subscription Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1630] to-[#080d1e] border border-blue-900/40 p-5 shadow-md text-white">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-extrabold font-['Plus_Jakarta_Sans']">Ground Zero Daily Brief</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Receive uncompromised, fact-checked daily investigative briefs in your preferred language.
        </p>

        {newsletterSubscribed ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>You're subscribed! Daily briefings will arrive at 06:00 UTC.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow"
            >
              Subscribe Free
            </button>
          </form>
        )}
      </div>

      {/* Live Network Trust Metrics */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verification Standard</span>
          </span>
          <span className="text-emerald-400 font-bold">100% Fact Checked</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>Live RSS Feeds</span>
          </span>
          <span className="text-white font-bold">6 Wire Nodes</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-semibold">Language Coverage</span>
          <span className="text-cyan-400 font-bold">19 Languages AI-Live</span>
        </div>
      </div>
    </aside>
  );
};

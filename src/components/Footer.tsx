import React from 'react';
import { useNews } from '../context/NewsContext';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { NEWS_CATEGORIES } from '../constants/categories';
import {
  Shield,
  Radio,
  Rss,
  Globe,
  Smartphone,
  ExternalLink,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setLanguage, setCategory, setActiveView } = useNews();

  return (
    <footer className="w-full bg-[#050811] text-slate-400 border-t border-slate-800/80 pt-12 pb-8 mt-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xs">
                GZ
              </div>
              <span className="text-xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans']">
                GROUND ZERO <span className="text-red-500">NEWS</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              An independent, international digital news network dedicated to uncompromised truth, verified reporting, and multi-lingual accessibility powered by frontier AI.
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Hallucination Journalistic Standard</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All automated news dispatches undergo dual-stage fact-verification, source attribution, and human editorial oversight before syndication.
              </p>
            </div>

            {/* Mobile App Teaser */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-900/40">
              <Smartphone className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-200">Mobile Apps API Ready</div>
                <div className="text-[11px] text-slate-400">Android APK & iOS builds ready via unified backend.</div>
              </div>
            </div>
          </div>

          {/* Col 2: News Sections */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Top Desks
            </h4>
            <ul className="space-y-2 text-xs">
              {['India News', 'World News', 'Punjab News', 'Assam News', 'Technology', 'Artificial Intelligence', 'Economy', 'Science', 'Exclusive Reports'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      setCategory(cat);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-red-400 transition"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Editorial Standards */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Editorial Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveView('guidelines')}
                  className="hover:text-red-400 transition"
                >
                  Verification & Ethics Code
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('guidelines')}
                  className="hover:text-red-400 transition"
                >
                  Corrections & Retractions Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('guidelines')}
                  className="hover:text-red-400 transition"
                >
                  AI Wire Ingestion Transparency
                </button>
              </li>
              <li>
                <a
                  href="/news-sitemap.xml"
                  target="_blank"
                  className="hover:text-red-400 transition flex items-center gap-1"
                >
                  <span>Google News Feed</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="/api/rss.xml"
                  target="_blank"
                  className="hover:text-red-400 transition flex items-center gap-1"
                >
                  <span>GZ News RSS Wire</span>
                  <Rss className="w-3 h-3 text-amber-500" />
                </a>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="hover:text-red-400 transition flex items-center gap-1"
                >
                  <span>XML Sitemap</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: 19 Languages Quick Bar */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              19 Languages
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-900 hover:bg-red-600 hover:text-white border border-slate-800 text-slate-300 transition"
                  title={`Switch to ${lang.name}`}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Ground Zero News Network. All rights reserved. Truth First. News Everywhere.</p>
          <div className="flex items-center gap-4">
            <span>PWA Enabled</span>
            <span>•</span>
            <span>Google News Compatible</span>
            <span>•</span>
            <span>Vercel / Cloud Run Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

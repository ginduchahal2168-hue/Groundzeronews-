import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from '../constants/languages';
import { SupportedLanguage } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Globe,
  Search,
  Moon,
  Sun,
  Shield,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Menu,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
    ttsState,
    stopTTS,
    breakingArticles,
    setActiveArticle,
  } = useNews();

  const { user, role } = useAuth();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [timeUtc, setTimeUtc] = useState('');
  const [timeIst, setTimeIst] = useState('');

  // Clock updates
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(
        now.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) + ' UTC'
      );
      setTimeIst(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090e1a]/95 backdrop-blur-md text-slate-100 shadow-md">
      {/* Top International Broadcast Bar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1 text-[11px] font-medium border-b border-slate-800/80 bg-[#060913] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-red-500 font-bold uppercase tracking-wider">
            <Radio className="w-3 h-3 animate-pulse text-red-500" />
            <span>International Live Wire</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{timeUtc}</span>
            <span className="text-slate-600">•</span>
            <span>{timeIst}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 italic">"Truth First. News Everywhere."</span>
        </div>

        <div className="flex items-center gap-4">
          {ttsState.isPlaying && (
            <button
              onClick={stopTTS}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] animate-pulse"
            >
              <Volume2 className="w-3 h-3" />
              <span>Audio Briefing Playing (Stop)</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Google News Partner</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-semibold">19 Languages AI-Live</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              setActiveView('home');
              setActiveArticle(null);
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Crosshair / Radar Logo Mark */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-slate-900 to-[#0e172a] border border-red-600/40 p-2 flex items-center justify-center shadow-lg group-hover:border-red-500 transition">
              <div className="absolute inset-0 rounded-xl bg-red-600/10 group-hover:bg-red-600/20 transition" />
              <div className="relative flex items-center justify-center w-full h-full">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                <div className="absolute w-6 h-6 rounded-full border border-red-500/60 animate-ping opacity-40" />
                <div className="absolute w-8 h-8 rounded-full border border-slate-700" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  GROUND ZERO
                </span>
                <span className="text-xs sm:text-sm font-extrabold px-1.5 py-0.5 rounded bg-red-600 text-white tracking-widest uppercase">
                  NEWS
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
                Truth First. News Everywhere.
              </span>
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search global & regional reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 19-Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition"
                title="Select language (19 Languages supported)"
              >
                <Globe className="w-3.5 h-3.5 text-red-500" />
                <span className="font-bold text-white">
                  {LANGUAGE_MAP[language]?.nativeName || 'Language'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0b1329] border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">Select Language</span>
                      <span className="text-[10px] text-red-400 font-semibold uppercase">19 Supported</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Find language (e.g. Punjabi, Hindi)..."
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
                    {filteredLanguages.map((lang) => {
                      const isSelected = lang.code === language;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangOpen(false);
                            setLangSearch('');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition ${
                            isSelected
                              ? 'bg-red-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{lang.nativeName}</span>
                            <span className="text-[11px] opacity-75">({lang.name})</span>
                          </div>
                          {lang.isRTL && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-amber-300 uppercase">
                              RTL
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Admin Newsroom Button */}
            <button
              onClick={() => setActiveView(activeView === 'admin' ? 'home' : 'admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeView === 'admin'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Editorial Desk & AI News Automation"
            >
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Admin Desk</span>
              <span className="text-[9px] px-1 rounded bg-slate-900 text-red-300 uppercase">
                {role.replace('_', ' ')}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Time: {timeUtc}</span>
              <button
                onClick={() => {
                  setActiveView('guidelines');
                  setIsMobileMenuOpen(false);
                }}
                className="text-red-400 hover:underline"
              >
                Editorial Guidelines
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

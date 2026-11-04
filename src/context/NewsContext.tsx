import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NewsArticle, SupportedLanguage, NewsCategory } from '../types';
import { LANGUAGE_MAP, DEFAULT_LANGUAGE } from '../constants/languages';

import { FALLBACK_ARTICLES } from '../constants/initialArticles.ts';

function safeStorageGet(key: string, fallback: string): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key) || fallback;
    }
  } catch {
    // Ignore restricted storage contexts
  }
  return fallback;
}

function safeStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore restricted storage contexts
  }
}

interface NewsContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isRTL: boolean;
  category: string;
  setCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  articles: NewsArticle[];
  breakingArticles: NewsArticle[];
  featuredArticle: NewsArticle | null;
  trendingArticles: NewsArticle[];
  activeArticle: NewsArticle | null;
  setActiveArticle: (article: NewsArticle | null) => void;
  activeView: 'home' | 'article' | 'admin' | 'guidelines' | 'privacy';
  setActiveView: (view: 'home' | 'article' | 'admin' | 'guidelines' | 'privacy') => void;
  isLoading: boolean;
  isTranslating: boolean;
  refreshArticles: () => Promise<void>;
  translateActiveArticle: (targetLang: SupportedLanguage) => Promise<void>;
  triggerAiAutomation: () => Promise<any>;
  submitComment: (articleId: string, name: string, email: string, content: string) => Promise<boolean>;
  ttsState: {
    isPlaying: boolean;
    articleId: string | null;
    rate: number;
  };
  playTTS: (article: NewsArticle) => void;
  stopTTS: () => void;
  setTtsRate: (rate: number) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (safeStorageGet('gz_news_lang', DEFAULT_LANGUAGE) as SupportedLanguage);
  });

  const [category, setCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (safeStorageGet('gz_theme', 'dark') as 'dark' | 'light');
  });

  const [articles, setArticles] = useState<NewsArticle[]>(FALLBACK_ARTICLES);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'article' | 'admin' | 'guidelines' | 'privacy'>('home');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // Audio Text-To-Speech State
  const [ttsState, setTtsState] = useState<{
    isPlaying: boolean;
    articleId: string | null;
    rate: number;
  }>({
    isPlaying: false,
    articleId: null,
    rate: 1.0,
  });

  const isRTL = LANGUAGE_MAP[language]?.isRTL || false;

  // Sync RTL and lang attribute
  useEffect(() => {
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    } catch {}
    safeStorageSet('gz_news_lang', language);
  }, [language, isRTL]);

  // Sync theme
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
    safeStorageSet('gz_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    showToast(`News language changed to ${LANGUAGE_MAP[lang]?.name || lang} (${LANGUAGE_MAP[lang]?.nativeName || ''})`);
  };

  // Fetch articles from API
  const refreshArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') {
        params.append('category', category);
      }
      if (language) {
        params.append('language', language);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/news/articles?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error('[NewsContext] Failed to load articles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category, language, searchQuery]);

  useEffect(() => {
    refreshArticles();
  }, [refreshArticles]);

  // Derived collections
  const breakingArticles = articles.filter((a) => a.isBreaking);
  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0] || null;
  const trendingArticles = articles.filter((a) => a.isTrending).slice(0, 5);

  // Translate active article on the fly
  const translateActiveArticle = async (targetLang: SupportedLanguage) => {
    if (!activeArticle) return;
    setIsTranslating(true);
    showToast(`AI translating article into ${LANGUAGE_MAP[targetLang]?.name}...`);

    try {
      const res = await fetch('/api/news/translate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: activeArticle.id,
          targetLanguage: targetLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const tr = data.translation;
        setActiveArticle((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            currentLanguage: targetLang,
            headline: tr.headline,
            summary: tr.summary,
            fullBody: tr.fullBody || prev.fullBody,
            translations: {
              ...(prev.translations || {}),
              [targetLang]: tr,
            },
          };
        });
        showToast(`Article successfully localized to ${LANGUAGE_MAP[targetLang]?.name} (${LANGUAGE_MAP[targetLang]?.nativeName})`);
      }
    } catch (err: any) {
      console.error('[NewsContext] Translation failed:', err);
      showToast('Translation service unavailable. Please check API settings.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Trigger manual AI ingestion
  const triggerAiAutomation = async () => {
    showToast('Executing Ground Zero AI news ingestion & fact-verification cycle...');
    try {
      const res = await fetch('/api/news/process-rss', {
        method: 'POST',
      });
      const data = await res.json();
      await refreshArticles();
      showToast(data.message || 'AI news cycle completed.');
      return data;
    } catch (err: any) {
      showToast(`Automation cycle failed: ${err.message}`);
      throw err;
    }
  };

  // Submit reader comment
  const submitComment = async (
    articleId: string,
    name: string,
    email: string,
    content: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/news/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          userName: name,
          userEmail: email,
          content,
        }),
      });
      if (res.ok) {
        showToast('Your comment has been submitted and published.');
        return true;
      }
      return false;
    } catch {
      showToast('Error submitting comment.');
      return false;
    }
  };

  // Text-To-Speech implementation
  const stopTTS = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setTtsState((prev) => ({ ...prev, isPlaying: false, articleId: null }));
  };

  const playTTS = (article: NewsArticle) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Speech audio is not supported in this browser.');
      return;
    }

    if (ttsState.isPlaying && ttsState.articleId === article.id) {
      stopTTS();
      return;
    }

    stopTTS();

    const textToRead = `${article.headline}. Published by ${article.sourceName}. ${article.summary}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = ttsState.rate;

    // Select suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    const langCode = article.currentLanguage || language;
    const matchingVoice = voices.find((v) => v.lang.startsWith(langCode));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setTtsState((prev) => ({ ...prev, isPlaying: false, articleId: null }));
    };

    utterance.onerror = () => {
      setTtsState((prev) => ({ ...prev, isPlaying: false, articleId: null }));
    };

    window.speechSynthesis.speak(utterance);
    setTtsState({
      isPlaying: true,
      articleId: article.id,
      rate: ttsState.rate,
    });
    showToast(`Audio reader started: ${article.headline.slice(0, 40)}...`);
  };

  const setTtsRate = (rate: number) => {
    setTtsState((prev) => ({ ...prev, rate }));
  };

  return (
    <NewsContext.Provider
      value={{
        language,
        setLanguage,
        isRTL,
        category,
        setCategory,
        searchQuery,
        setSearchQuery,
        theme,
        toggleTheme,
        articles,
        breakingArticles,
        featuredArticle,
        trendingArticles,
        activeArticle,
        setActiveArticle,
        activeView,
        setActiveView,
        isLoading,
        isTranslating,
        refreshArticles,
        translateActiveArticle,
        triggerAiAutomation,
        submitComment,
        ttsState,
        playTTS,
        stopTTS,
        setTtsRate,
        toast,
        showToast,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export function useNews() {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error('useNews must be used within a NewsProvider');
  return ctx;
}

import fs from 'fs';
import path from 'path';
import type {
  NewsArticle,
  RssFeed,
  Advertisement,
  SiteSettings,
  AdminUser,
  AiAutomationLog,
  NewsComment,
  SupportedLanguage,
  ArticleTranslation,
} from '../src/types/index.ts';
import {
  INITIAL_ARTICLES,
  INITIAL_FEEDS,
  INITIAL_ADS,
  INITIAL_SETTINGS,
  INITIAL_ADMIN_USERS,
} from './seedData.ts';

interface DatabaseSchema {
  articles: NewsArticle[];
  feeds: RssFeed[];
  ads: Advertisement[];
  settings: SiteSettings;
  users: AdminUser[];
  logs: AiAutomationLog[];
  comments: NewsComment[];
}

const DB_DIR = path.resolve('data');
const DB_FILE = path.join(DB_DIR, 'groundzero_db.json');

let dbCache: DatabaseSchema | null = null;

function loadDatabase(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(content);
      return dbCache!;
    } catch (err) {
      console.error('[DB] Failed reading db file, re-seeding:', err);
    }
  }

  // Seed default database
  dbCache = {
    articles: INITIAL_ARTICLES,
    feeds: INITIAL_FEEDS,
    ads: INITIAL_ADS,
    settings: INITIAL_SETTINGS,
    users: INITIAL_ADMIN_USERS,
    logs: [
      {
        id: 'log-init-1',
        timestamp: new Date().toISOString(),
        taskType: 'rss_ingest',
        status: 'success',
        source: 'Automated Seed Registry',
        details: 'System initialized with 9 verified multi-lingual investigative reports and 6 live RSS wire feeds.',
        articlesProcessed: INITIAL_ARTICLES.length,
        durationMs: 820,
      },
    ],
    comments: [
      {
        id: 'comm-1',
        articleId: 'gzn-lead-001',
        userName: 'Major Jaswinder Brar (Retd.)',
        content: 'Groundbreaking analysis on the transmission infrastructure. Without UHVDC links, renewable power is routinely curtailed.',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'approved',
        likes: 12,
      },
      {
        id: 'comm-2',
        articleId: 'gzn-lead-009',
        userName: 'Dr. Katherine Vance',
        content: 'Commendable investigative reporting. The voluntary carbon offset market has needed forensic scrutiny of this depth for years.',
        createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
        status: 'approved',
        likes: 24,
      },
    ],
  };

  saveDatabase(dbCache);
  return dbCache;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    dbCache = data;
  } catch (err) {
    console.error('[DB] Failed writing to db file:', err);
  }
}

export const db = {
  getArticles(params?: {
    category?: string;
    language?: SupportedLanguage;
    status?: string;
    search?: string;
    breaking?: boolean;
    trending?: boolean;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const data = loadDatabase();
    let list = [...data.articles];

    // Status filter
    if (params?.status) {
      list = list.filter((a) => a.status === params.status);
    } else {
      // By default for public reader, show only published
      list = list.filter((a) => a.status === 'published');
    }

    // Category filter
    if (params?.category && params.category !== 'All' && params.category !== 'all') {
      list = list.filter((a) => a.category.toLowerCase() === params.category!.toLowerCase());
    }

    // Breaking filter
    if (params?.breaking !== undefined) {
      list = list.filter((a) => a.isBreaking === params.breaking);
    }

    // Trending filter
    if (params?.trending !== undefined) {
      list = list.filter((a) => a.isTrending === params.trending);
    }

    // Featured filter
    if (params?.featured !== undefined) {
      list = list.filter((a) => a.isFeatured === params.featured);
    }

    // Search query
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.headline.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort by publication date descending
    list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Localize articles if target language is requested
    const lang = params?.language || 'en';
    const localized = list.map((a) => {
      if (lang === 'en' || !a.translations[lang]) {
        return { ...a, currentLanguage: lang };
      }
      const t = a.translations[lang];
      return {
        ...a,
        currentLanguage: lang,
        headline: t.headline || a.headline,
        summary: t.summary || a.summary,
        fullBody: t.fullBody || a.fullBody,
      };
    });

    const offset = params?.offset || 0;
    const limit = params?.limit || 50;
    return {
      total: localized.length,
      articles: localized.slice(offset, offset + limit),
    };
  },

  getAllAdminArticles() {
    const data = loadDatabase();
    return [...data.articles].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  },

  getArticleById(id: string, language?: SupportedLanguage): NewsArticle | null {
    const data = loadDatabase();
    const found = data.articles.find((a) => a.id === id);
    if (!found) return null;

    // Increment view count
    found.viewCount = (found.viewCount || 0) + 1;
    saveDatabase(data);

    const lang = language || 'en';
    if (lang !== 'en' && found.translations[lang]) {
      const t = found.translations[lang];
      return {
        ...found,
        currentLanguage: lang,
        headline: t.headline || found.headline,
        summary: t.summary || found.summary,
        fullBody: t.fullBody || found.fullBody,
      };
    }
    return { ...found, currentLanguage: lang };
  },

  createArticle(article: NewsArticle): NewsArticle {
    const data = loadDatabase();
    data.articles.unshift(article);
    saveDatabase(data);
    return article;
  },

  updateArticle(id: string, updates: Partial<NewsArticle>): NewsArticle | null {
    const data = loadDatabase();
    const idx = data.articles.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    data.articles[idx] = {
      ...data.articles[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(data);
    return data.articles[idx];
  },

  deleteArticle(id: string): boolean {
    const data = loadDatabase();
    const prevLen = data.articles.length;
    data.articles = data.articles.filter((a) => a.id !== id);
    if (data.articles.length !== prevLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  saveTranslation(articleId: string, translation: ArticleTranslation): boolean {
    const data = loadDatabase();
    const article = data.articles.find((a) => a.id === articleId);
    if (!article) return false;

    article.translations = article.translations || {};
    article.translations[translation.language] = translation;
    article.updatedAt = new Date().toISOString();
    saveDatabase(data);
    return true;
  },

  // FEEDS
  getFeeds(): RssFeed[] {
    const data = loadDatabase();
    return data.feeds;
  },

  addFeed(feed: RssFeed): RssFeed {
    const data = loadDatabase();
    data.feeds.push(feed);
    saveDatabase(data);
    return feed;
  },

  updateFeed(id: string, updates: Partial<RssFeed>): RssFeed | null {
    const data = loadDatabase();
    const idx = data.feeds.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    data.feeds[idx] = { ...data.feeds[idx], ...updates };
    saveDatabase(data);
    return data.feeds[idx];
  },

  deleteFeed(id: string): boolean {
    const data = loadDatabase();
    const initial = data.feeds.length;
    data.feeds = data.feeds.filter((f) => f.id !== id);
    if (data.feeds.length !== initial) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // SETTINGS
  getSettings(): SiteSettings {
    const data = loadDatabase();
    return data.settings;
  },

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    const data = loadDatabase();
    data.settings = { ...data.settings, ...updates };
    saveDatabase(data);
    return data.settings;
  },

  // ADS
  getAds(): Advertisement[] {
    const data = loadDatabase();
    return data.ads;
  },

  saveAd(ad: Advertisement): Advertisement {
    const data = loadDatabase();
    const idx = data.ads.findIndex((a) => a.id === ad.id);
    if (idx >= 0) {
      data.ads[idx] = ad;
    } else {
      data.ads.push(ad);
    }
    saveDatabase(data);
    return ad;
  },

  deleteAd(id: string): boolean {
    const data = loadDatabase();
    const count = data.ads.length;
    data.ads = data.ads.filter((a) => a.id !== id);
    if (data.ads.length !== count) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  incrementAdMetric(id: string, type: 'impression' | 'click') {
    const data = loadDatabase();
    const ad = data.ads.find((a) => a.id === id);
    if (ad) {
      if (type === 'impression') ad.impressions = (ad.impressions || 0) + 1;
      if (type === 'click') ad.clicks = (ad.clicks || 0) + 1;
      saveDatabase(data);
    }
  },

  // COMMENTS
  getComments(articleId: string): NewsComment[] {
    const data = loadDatabase();
    return data.comments
      .filter((c) => c.articleId === articleId && c.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addComment(comment: NewsComment): NewsComment {
    const data = loadDatabase();
    data.comments.unshift(comment);
    saveDatabase(data);
    return comment;
  },

  // LOGS
  getAiLogs(): AiAutomationLog[] {
    const data = loadDatabase();
    return data.logs.slice(0, 100);
  },

  addAiLog(log: AiAutomationLog): void {
    const data = loadDatabase();
    data.logs.unshift(log);
    if (data.logs.length > 200) data.logs.pop();
    saveDatabase(data);
  },

  // STATS
  getStats() {
    const data = loadDatabase();
    const totalArticles = data.articles.length;
    const publishedArticles = data.articles.filter((a) => a.status === 'published').length;
    const pendingApproval = data.articles.filter((a) => a.status === 'pending_approval').length;
    const totalViews = data.articles.reduce((acc, a) => acc + (a.viewCount || 0), 0);

    const categoryDistribution: Record<string, number> = {};
    for (const a of data.articles) {
      categoryDistribution[a.category] = (categoryDistribution[a.category] || 0) + 1;
    }

    let totalTranslations = 0;
    for (const a of data.articles) {
      totalTranslations += Object.keys(a.translations || {}).length;
    }

    return {
      totalArticles,
      publishedArticles,
      pendingApproval,
      totalViews,
      totalTranslations,
      totalFeeds: data.feeds.length,
      activeFeeds: data.feeds.filter((f) => f.isActive).length,
      categoryDistribution,
      lastAutoRunAt: data.settings.lastAutoRunAt,
    };
  },
};

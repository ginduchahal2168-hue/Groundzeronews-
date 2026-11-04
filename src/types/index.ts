export type SupportedLanguage =
  | 'pa' // Punjabi
  | 'hi' // Hindi
  | 'en' // English
  | 'as' // Assamese
  | 'bn' // Bengali
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'ml' // Malayalam
  | 'kn' // Kannada
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'ur' // Urdu
  | 'fr' // French
  | 'es' // Spanish
  | 'ar' // Arabic
  | 'de' // German
  | 'ru' // Russian
  | 'zh' // Chinese
  | 'ja'; // Japanese

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  isRTL?: boolean;
  scriptFont?: string;
  enabled: boolean;
}

export type NewsCategory =
  | 'Breaking News'
  | 'India News'
  | 'World News'
  | 'Punjab News'
  | 'Assam News'
  | 'Politics'
  | 'Business'
  | 'Economy'
  | 'Technology'
  | 'Artificial Intelligence'
  | 'Science'
  | 'Sports'
  | 'Entertainment'
  | 'Education'
  | 'Health'
  | 'Crime'
  | 'Defence'
  | 'Agriculture'
  | 'Weather'
  | 'Lifestyle'
  | 'Viral News'
  | 'Opinion'
  | 'Exclusive Reports';

export type ArticleStatus = 'draft' | 'pending_approval' | 'published' | 'rejected' | 'archived';

export type VerificationStatus = 'confirmed' | 'developing' | 'investigative' | 'official_release';

export interface ArticleTranslation {
  language: SupportedLanguage;
  headline: string;
  summary: string;
  fullBody?: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  translatedAt: string;
}

export interface NewsArticle {
  id: string;
  originalLanguage: SupportedLanguage;
  currentLanguage?: SupportedLanguage;
  headline: string;
  summary: string;
  fullBody: string;
  category: NewsCategory;
  tags: string[];
  imageUrl: string;
  imageCaption?: string;
  imageCredit?: string;
  sourceName: string;
  sourceUrl: string;
  author: string;
  isAiGenerated: boolean;
  verificationStatus: VerificationStatus;
  status: ArticleStatus;
  isBreaking: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isSponsored?: boolean;
  sponsoredBy?: string;
  viewCount: number;
  readingTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
  translations: Record<string, ArticleTranslation>;
  commentsCount?: number;
  audioUrl?: string;
}

export interface NewsComment {
  id: string;
  articleId: string;
  userName: string;
  userEmail?: string;
  content: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'flagged';
  likes: number;
}

export interface RssFeed {
  id: string;
  name: string;
  url: string;
  category: NewsCategory;
  language: SupportedLanguage;
  isActive: boolean;
  lastFetchedAt?: string;
  itemsFetchedCount?: number;
  statusMessage?: string;
}

export type UserRole = 'super_admin' | 'editor' | 'journalist' | 'moderator';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  location: 'header_banner' | 'sidebar' | 'in_feed' | 'article_bottom';
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  sponsorName: string;
  startDate: string;
  endDate: string;
}

export interface AiAutomationLog {
  id: string;
  timestamp: string;
  taskType: 'rss_ingest' | 'summarize' | 'translate' | 'deduplicate' | 'moderation' | 'tts';
  status: 'success' | 'warning' | 'error';
  source: string;
  details: string;
  articlesProcessed: number;
  durationMs: number;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  automationIntervalMinutes: 5 | 15 | 30 | 60;
  autoPublishAiNews: boolean;
  defaultLanguages: SupportedLanguage[];
  aiModelName: string;
  pushNotificationsEnabled: boolean;
  adSenseClientId?: string;
  lastAutoRunAt?: string;
}

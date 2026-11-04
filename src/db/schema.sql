-- ==============================================================================
-- GROUND ZERO NEWS – PRODUCTION POSTGRESQL / SUPABASE DATABASE SCHEMA
-- "Truth First. News Everywhere."
-- Fully normalized relational architecture with Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('super_admin', 'editor', 'journalist', 'moderator', 'subscriber');
CREATE TYPE article_status AS ENUM ('draft', 'pending_approval', 'published', 'rejected', 'archived');
CREATE TYPE verification_status AS ENUM ('confirmed', 'developing', 'investigative', 'official_release');
CREATE TYPE log_task_type AS ENUM ('rss_ingest', 'summarize', 'translate', 'deduplicate', 'moderation', 'tts');

-- 3. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'journalist' NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    badge_color VARCHAR(50) DEFAULT 'bg-blue-600 text-white',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RSS FEEDS & NEWS SOURCES
CREATE TABLE IF NOT EXISTS rss_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    feed_url TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    default_language VARCHAR(10) DEFAULT 'en' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    fetch_interval_minutes INT DEFAULT 15,
    last_fetched_at TIMESTAMPTZ,
    items_fetched_count INT DEFAULT 0,
    status_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ARTICLES (CANONICAL SOURCE RECORD)
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_language VARCHAR(10) DEFAULT 'en' NOT NULL,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_body TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT NOT NULL,
    image_caption TEXT,
    image_credit TEXT,
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_display_name VARCHAR(255) NOT NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    verification_status verification_status DEFAULT 'confirmed' NOT NULL,
    status article_status DEFAULT 'draft' NOT NULL,
    is_breaking BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    sponsored_by VARCHAR(255),
    view_count INT DEFAULT 0,
    reading_time_minutes INT DEFAULT 3,
    audio_url TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ARTICLE TRANSLATIONS (19 LANGUAGES REPOSITORY)
CREATE TABLE IF NOT EXISTS article_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_body TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    keywords TEXT[] DEFAULT '{}',
    translated_by_model VARCHAR(100) DEFAULT 'gemini-3.8-flash',
    translated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, language_code)
);

-- 8. BREAKING NEWS ALERTS & BROADCASTS
CREATE TABLE IF NOT EXISTS breaking_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    headline_alert TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'critical',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER COMMENTS & ENGAGEMENT
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'approved',
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ADVERTISEMENTS & SPONSORSHIPS
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    location VARCHAR(50) NOT NULL, -- header_banner, sidebar, in_feed, article_bottom
    image_url TEXT NOT NULL,
    target_url TEXT NOT NULL,
    sponsor_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AI AUTOMATION LOGS & AUDIT TRAIL
CREATE TABLE IF NOT EXISTS ai_automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type log_task_type NOT NULL,
    status VARCHAR(50) NOT NULL, -- success, warning, error
    source VARCHAR(255) NOT NULL,
    details TEXT,
    articles_processed INT DEFAULT 0,
    duration_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PUSH SUBSCRIBERS & NEWSLETTER RECIPIENTS
CREATE TABLE IF NOT EXISTS push_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT UNIQUE NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    category_preferences TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. WEBSITE CONFIGURATION & EDITORIAL SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_name VARCHAR(255) DEFAULT 'Ground Zero News',
    tagline VARCHAR(255) DEFAULT 'Truth First. News Everywhere.',
    contact_email VARCHAR(255) DEFAULT 'contact@groundzeronews.org',
    automation_interval_minutes INT DEFAULT 15,
    auto_publish_ai_news BOOLEAN DEFAULT FALSE,
    default_languages TEXT[] DEFAULT ARRAY['en', 'pa', 'hi', 'ur', 'bn', 'ar'],
    ai_model_name VARCHAR(100) DEFAULT 'gemini-3.8-flash',
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    adsense_client_id VARCHAR(100),
    last_auto_run_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_breaking ON articles(is_breaking) WHERE is_breaking = TRUE;
CREATE INDEX IF NOT EXISTS idx_translations_lang ON article_translations(language_code, article_id);
CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id, status);

-- 15. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public READ for Published Articles
CREATE POLICY "Public articles are viewable by everyone" 
    ON articles FOR SELECT 
    USING (status = 'published');

-- Public READ for Article Translations
CREATE POLICY "Public translations viewable by everyone" 
    ON article_translations FOR SELECT 
    USING (EXISTS (SELECT 1 FROM articles WHERE articles.id = article_translations.article_id AND articles.status = 'published'));

-- Public READ for Active Ads
CREATE POLICY "Active ads viewable by everyone" 
    ON advertisements FOR SELECT 
    USING (is_active = TRUE);

-- Public INSERT for Comments
CREATE POLICY "Public can submit comments" 
    ON comments FOR INSERT 
    WITH CHECK (true);

-- Admin & Editor Full Access Policies
CREATE POLICY "Admins have full access to articles" 
    ON articles FOR ALL 
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'editor', 'journalist'));

CREATE POLICY "Admins have full access to translations" 
    ON article_translations FOR ALL 
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'editor'));

CREATE POLICY "Admins have full access to rss feeds" 
    ON rss_feeds FOR ALL 
    USING (auth.jwt() ->> 'role' IN ('super_admin', 'editor'));

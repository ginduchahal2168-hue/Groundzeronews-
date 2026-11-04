import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { translateArticleWithAi } from './server/geminiService.ts';
import { runNewsAutomationCycle, initNewsEngineScheduler } from './server/rssEngine.ts';
import type { SupportedLanguage } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Enable standard CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==============================================================================
// 1. PUBLIC & CLIENT ARTICLE APIS
// ==============================================================================

app.get('/api/news/articles', (req, res) => {
  try {
    const { category, language, search, breaking, trending, featured, status, limit, offset } = req.query;

    const result = db.getArticles({
      category: category ? String(category) : undefined,
      language: language ? (String(language) as SupportedLanguage) : 'en',
      search: search ? String(search) : undefined,
      breaking: breaking !== undefined ? breaking === 'true' : undefined,
      trending: trending !== undefined ? trending === 'true' : undefined,
      featured: featured !== undefined ? featured === 'true' : undefined,
      status: status ? String(status) : undefined,
      limit: limit ? parseInt(String(limit), 10) : 50,
      offset: offset ? parseInt(String(offset), 10) : 0,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/news/articles/:id', (req, res) => {
  try {
    const { language } = req.query;
    const article = db.getArticleById(
      req.params.id,
      language ? (String(language) as SupportedLanguage) : 'en'
    );
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// On-demand AI translation for any of the 19 languages!
app.post('/api/news/translate-article', async (req, res) => {
  try {
    const { articleId, targetLanguage } = req.body;
    if (!articleId || !targetLanguage) {
      return res.status(400).json({ error: 'Missing articleId or targetLanguage' });
    }

    const article = db.getArticleById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if translation is already cached
    if (article.translations && article.translations[targetLanguage]) {
      return res.json({
        cached: true,
        translation: article.translations[targetLanguage],
      });
    }

    // Call server-side Gemini
    console.log(`[Translate API] Translating article ${articleId} into ${targetLanguage}...`);
    const translation = await translateArticleWithAi(
      article.headline,
      article.summary,
      article.fullBody,
      targetLanguage
    );

    const fullTranslation = {
      language: targetLanguage,
      ...translation,
      translatedAt: new Date().toISOString(),
    };

    db.saveTranslation(articleId, fullTranslation);

    res.json({
      cached: false,
      translation: fullTranslation,
    });
  } catch (err: any) {
    console.error('[Translate API] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 2. ADMIN & EDITORIAL APIS
// ==============================================================================

app.get('/api/admin/articles', (_req, res) => {
  try {
    const articles = db.getAllAdminArticles();
    res.json(articles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/news/articles', (req, res) => {
  try {
    const body = req.body;
    const now = new Date().toISOString();
    const newArticle = {
      id: `gzn-${Date.now()}`,
      originalLanguage: body.originalLanguage || 'en',
      headline: body.headline,
      summary: body.summary,
      fullBody: body.fullBody || body.summary,
      category: body.category || 'World News',
      tags: body.tags || [],
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
      imageCaption: body.imageCaption,
      imageCredit: body.imageCredit,
      sourceName: body.sourceName || 'Ground Zero Newsroom',
      sourceUrl: body.sourceUrl || 'https://groundzeronews.org',
      author: body.author || 'Ground Zero Editorial Desk',
      isAiGenerated: body.isAiGenerated || false,
      verificationStatus: body.verificationStatus || 'confirmed',
      status: body.status || 'published',
      isBreaking: body.isBreaking || false,
      isFeatured: body.isFeatured || false,
      isTrending: body.isTrending || false,
      viewCount: 0,
      readingTimeMinutes: Math.max(1, Math.ceil((body.fullBody || body.summary || '').split(' ').length / 200)),
      publishedAt: body.publishedAt || now,
      updatedAt: now,
      commentsCount: 0,
      translations: {
        en: {
          language: 'en',
          headline: body.headline,
          summary: body.summary,
          fullBody: body.fullBody,
          seoTitle: body.headline,
          seoDescription: body.summary.slice(0, 150),
          keywords: body.tags || ['news'],
          translatedAt: now,
        },
      },
    };

    const created = db.createArticle(newArticle as any);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/news/articles/:id', (req, res) => {
  try {
    const updated = db.updateArticle(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/news/articles/:id', (req, res) => {
  try {
    const success = db.deleteArticle(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger AI Automation & RSS Ingestion
app.post('/api/news/process-rss', async (_req, res) => {
  try {
    const result = await runNewsAutomationCycle(true);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Comments API
app.get('/api/news/comments/:articleId', (req, res) => {
  try {
    const comments = db.getComments(req.params.articleId);
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/news/comments', (req, res) => {
  try {
    const { articleId, userName, userEmail, content } = req.body;
    if (!articleId || !userName || !content) {
      return res.status(400).json({ error: 'Missing required comment fields' });
    }

    const comment = db.addComment({
      id: `comm-${Date.now()}`,
      articleId,
      userName,
      userEmail,
      content,
      createdAt: new Date().toISOString(),
      status: 'approved',
      likes: 0,
    });

    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// RSS Feeds Management
app.get('/api/feeds', (_req, res) => {
  res.json(db.getFeeds());
});

app.post('/api/feeds', (req, res) => {
  try {
    const { name, url, category, language } = req.body;
    const newFeed = db.addFeed({
      id: `feed-${Date.now()}`,
      name,
      url,
      category: category || 'World News',
      language: language || 'en',
      isActive: true,
      itemsFetchedCount: 0,
      statusMessage: 'Ready for ingestion',
    });
    res.status(201).json(newFeed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/feeds/:id', (req, res) => {
  try {
    const updated = db.updateFeed(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Feed not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/feeds/:id', (req, res) => {
  try {
    const deleted = db.deleteFeed(req.params.id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Settings Management
app.get('/api/settings', (_req, res) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    if (req.body.automationIntervalMinutes) {
      initNewsEngineScheduler();
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Ads Management
app.get('/api/ads', (_req, res) => {
  res.json(db.getAds());
});

app.post('/api/ads', (req, res) => {
  try {
    const ad = db.saveAd({
      ...req.body,
      id: req.body.id || `ad-${Date.now()}`,
      impressions: req.body.impressions || 0,
      clicks: req.body.clicks || 0,
    });
    res.json(ad);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/ads/:id', (req, res) => {
  const success = db.deleteAd(req.params.id);
  res.json({ success });
});

app.post('/api/ads/:id/impression', (req, res) => {
  db.incrementAdMetric(req.params.id, 'impression');
  res.json({ success: true });
});

app.post('/api/ads/:id/click', (req, res) => {
  db.incrementAdMetric(req.params.id, 'click');
  res.json({ success: true });
});

// Analytics & Logs
app.get('/api/stats', (_req, res) => {
  res.json(db.getStats());
});

app.get('/api/logs', (_req, res) => {
  res.json(db.getAiLogs());
});

// Newsletter & Push Subscriptions
app.post('/api/newsletter', (req, res) => {
  const { email, language } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  res.json({
    success: true,
    message: `Subscribed ${email} to Ground Zero News daily briefings (${language || 'English'}).`,
  });
});

app.post('/api/push-subscribe', (req, res) => {
  res.json({
    success: true,
    message: 'Browser push notifications successfully configured for Ground Zero breaking alerts.',
  });
});

// Download full Supabase PostgreSQL Schema file
app.get('/api/export/schema.sql', (_req, res) => {
  const schemaPath = path.resolve('src/db/schema.sql');
  res.download(schemaPath, 'ground_zero_news_schema.sql');
});

// ==============================================================================
// 3. SEO, GOOGLE NEWS SITEMAP & SYNDICATION FEEDS
// ==============================================================================

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  const baseUrl = process.env.APP_URL || 'https://groundzeronews.org';
  res.send([
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    `Sitemap: ${baseUrl}/news-sitemap.xml`,
  ].join('\n'));
});

app.get('/sitemap.xml', (_req, res) => {
  const { articles } = db.getArticles({ limit: 1000 });
  const baseUrl = process.env.APP_URL || 'https://groundzeronews.org';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>`;

  for (const art of articles) {
    xml += `
  <url>
    <loc>${baseUrl}/#article-${art.id}</loc>
    <lastmod>${art.updatedAt.slice(0, 10)}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  xml += `\n</urlset>`;
  res.type('application/xml');
  res.send(xml);
});

// Official Google News XML Sitemap
app.get('/news-sitemap.xml', (_req, res) => {
  const { articles } = db.getArticles({ limit: 50 });
  const baseUrl = process.env.APP_URL || 'https://groundzeronews.org';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

  for (const art of articles) {
    const pubDate = new Date(art.publishedAt).toISOString();
    const lang = art.originalLanguage || 'en';
    const escapedTitle = art.headline.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    xml += `
  <url>
    <loc>${baseUrl}/#article-${art.id}</loc>
    <news:news>
      <news:publication>
        <news:name>Ground Zero News</news:name>
        <news:language>${lang}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapedTitle}</news:title>
    </news:news>
  </url>`;
  }

  xml += `\n</urlset>`;
  res.type('application/xml');
  res.send(xml);
});

// Official RSS Feed syndication
app.get('/api/rss.xml', (_req, res) => {
  const { articles } = db.getArticles({ limit: 30 });
  const baseUrl = process.env.APP_URL || 'https://groundzeronews.org';

  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Ground Zero News – Truth First. News Everywhere.</title>
  <link>${baseUrl}</link>
  <description>Verified breaking international and regional news with AI-powered multilingual reporting.</description>
  <language>en-US</language>
  <atom:link href="${baseUrl}/api/rss.xml" rel="self" type="application/rss+xml" />`;

  for (const art of articles) {
    const pubDate = new Date(art.publishedAt).toUTCString();
    xml += `
  <item>
    <title><![CDATA[${art.headline}]]></title>
    <link>${baseUrl}/#article-${art.id}</link>
    <guid>${baseUrl}/#article-${art.id}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${art.summary}]]></description>
    <category>${art.category}</category>
  </item>`;
  }

  xml += `
</channel>
</rss>`;

  res.type('application/rss+xml');
  res.send(xml);
});

// ==============================================================================
// 4. VITE DEV SERVER / STATIC SERVING
// ==============================================================================

// Catch unmatched API routes with JSON 404
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  const hasDist = fs.existsSync(indexHtmlPath);

  if (isProd || (process.env.NODE_ENV !== 'development' && hasDist)) {
    console.log('[Server] Serving production static assets from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
      } else {
        res.status(404).send('Ground Zero News terminal is building. Please refresh.');
      }
    });
  } else {
    console.log('[Server] Mounting Vite dev middleware...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`GROUND ZERO NEWS Server running on port ${PORT}`);
    console.log(`Tagline: Truth First. News Everywhere.`);
    console.log(`API endpoints ready. Google News sitemaps active.`);
    console.log(`====================================================`);

    // Start background automation scheduler
    initNewsEngineScheduler();
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
});

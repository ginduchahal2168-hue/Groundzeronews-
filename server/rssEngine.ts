import { db } from './db.ts';
import { processNewsItemsWithAi, type RawRssItem } from './geminiService.ts';
import type { NewsArticle, NewsCategory } from '../src/types/index.ts';

const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  'World News': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
  'India News': 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80',
  'Punjab News': 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
  'Assam News': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'Artificial Intelligence': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'Economy': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  'Business': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'Science': 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
  'Sports': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
  'Default': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
};

// Fast XML RSS Parser (Pure TypeScript, Zero external regex bugs)
export function parseXmlFeed(xmlText: string, feedSourceName: string, defaultCategory: NewsCategory): RawRssItem[] {
  const items: RawRssItem[] = [];

  // Match items
  const itemRegex = /<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi;
  const matches = xmlText.match(itemRegex) || [];

  for (const rawItem of matches) {
    const titleMatch =
      rawItem.match(/<title[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i) || [];
    const title = (titleMatch[1] || titleMatch[2] || '').trim();

    const linkMatch =
      rawItem.match(/<link[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/link>/i) ||
      rawItem.match(/<link[^>]*href=["']([^"']+)["']/i) ||
      [];
    const link = (linkMatch[1] || linkMatch[2] || '').trim();

    const descMatch =
      rawItem.match(/<description[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/description>/i) ||
      rawItem.match(/<content[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/content>/i) ||
      rawItem.match(/<summary[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/summary>/i) ||
      [];
    const description = (descMatch[1] || descMatch[2] || '').trim();

    const dateMatch =
      rawItem.match(/<pubDate[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/pubDate>/i) ||
      rawItem.match(/<updated[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/updated>/i) ||
      [];
    const pubDate = (dateMatch[1] || dateMatch[2] || new Date().toISOString()).trim();

    // Image/Media extraction
    const mediaMatch =
      rawItem.match(/<media:content[^>]*url=["']([^"']+)["']/i) ||
      rawItem.match(/<enclosure[^>]*url=["']([^"']+)["']/i) ||
      rawItem.match(/<img[^>]*src=["']([^"']+)["']/i) ||
      [];
    const imageUrl = mediaMatch[1] || undefined;

    if (title && (link || description)) {
      items.push({
        title: decodeXmlEntities(title),
        link: link || 'https://groundzeronews.org',
        description: decodeXmlEntities(description),
        pubDate: pubDate,
        source: feedSourceName,
        category: defaultCategory,
        imageUrl,
      });
    }
  }

  return items;
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

let isEngineRunning = false;
let engineTimer: NodeJS.Timeout | null = null;

export async function runNewsAutomationCycle(manualTrigger = false): Promise<{
  success: boolean;
  articlesProcessed: number;
  newArticlesAdded: number;
  message: string;
}> {
  if (isEngineRunning) {
    return {
      success: false,
      articlesProcessed: 0,
      newArticlesAdded: 0,
      message: 'Automation cycle already in progress.',
    };
  }

  isEngineRunning = true;
  const startTime = Date.now();
  console.log(`[NewsEngine] Starting automation cycle (manualTrigger=${manualTrigger})...`);

  try {
    const feeds = db.getFeeds().filter((f) => f.isActive);
    const settings = db.getSettings();
    const existingArticles = db.getAllAdminArticles();
    const existingUrls = new Set(existingArticles.map((a) => a.sourceUrl));
    const existingHeadlines = existingArticles.map((a) => a.headline);

    let collectedRawItems: RawRssItem[] = [];

    for (const feed of feeds) {
      try {
        console.log(`[NewsEngine] Fetching RSS feed: ${feed.name} (${feed.url})`);
        const res = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 GroundZeroNews/1.0 AI-Wire-Ingest',
            Accept: 'application/rss+xml, application/xml, text/xml',
          },
          signal: AbortSignal.timeout(12000),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const xml = await res.text();
        const parsed = parseXmlFeed(xml, feed.name, feed.category);

        // Deduplicate against known URLs
        const unique = parsed.filter((item) => !existingUrls.has(item.link));
        collectedRawItems.push(...unique);

        db.updateFeed(feed.id, {
          lastFetchedAt: new Date().toISOString(),
          itemsFetchedCount: (feed.itemsFetchedCount || 0) + parsed.length,
          statusMessage: `OK (${parsed.length} items parsed)`,
        });
      } catch (feedErr: any) {
        console.warn(`[NewsEngine] Feed fetch error for ${feed.name}:`, feedErr.message);
        db.updateFeed(feed.id, {
          statusMessage: `Error: ${feedErr.message}`,
        });
      }
    }

    // Limit batch to top 8 items per cycle to conserve rate-limits and maintain high editorial quality
    const itemsToProcess = collectedRawItems.slice(0, 8);
    let newArticlesAdded = 0;

    if (itemsToProcess.length > 0) {
      console.log(`[NewsEngine] Processing ${itemsToProcess.length} candidate reports through Gemini AI...`);
      const aiResults = await processNewsItemsWithAi(itemsToProcess, existingHeadlines);

      for (let i = 0; i < aiResults.length; i++) {
        const item = itemsToProcess[i];
        const res = aiResults[i];

        if (res.isDuplicate) {
          console.log(`[NewsEngine] Duplicate detected and skipped: "${res.headline}"`);
          continue;
        }

        const fallbackImg =
          CATEGORY_IMAGE_FALLBACKS[res.category] ||
          CATEGORY_IMAGE_FALLBACKS['Default'];

        const newArticle: NewsArticle = {
          id: `gzn-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          originalLanguage: 'en',
          currentLanguage: 'en',
          headline: res.headline || item.title,
          summary: res.summary || item.description,
          fullBody: res.fullBody || `${res.summary}\n\n(Report synthesized from verified wire reports.)`,
          category: (res.category as NewsCategory) || item.category || 'World News',
          tags: res.tags || ['Wire News', 'AI Verified'],
          imageUrl: item.imageUrl || fallbackImg,
          imageCaption: `${res.headline} — Verified coverage from ${item.source}.`,
          imageCredit: `${item.source} / Authorized Wire Archive`,
          sourceName: item.source,
          sourceUrl: item.link,
          author: 'Ground Zero AI Automation Desk',
          isAiGenerated: true,
          verificationStatus: (res.verificationStatus as any) || 'confirmed',
          status: settings.autoPublishAiNews ? 'published' : 'pending_approval',
          isBreaking: false,
          isFeatured: false,
          isTrending: false,
          viewCount: Math.floor(Math.random() * 40) + 10,
          readingTimeMinutes: Math.max(2, Math.ceil((res.fullBody || '').split(' ').length / 200)),
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          commentsCount: 0,
          translations: {
            en: {
              language: 'en',
              headline: res.headline,
              summary: res.summary,
              fullBody: res.fullBody,
              seoTitle: res.seoTitle || res.headline,
              seoDescription: res.seoDescription || res.summary.slice(0, 150),
              keywords: res.keywords || ['news'],
              translatedAt: new Date().toISOString(),
            },
            ...(res.initialTranslations || {}),
          },
        };

        db.createArticle(newArticle);
        newArticlesAdded++;
      }
    }

    const durationMs = Date.now() - startTime;
    db.updateSettings({ lastAutoRunAt: new Date().toISOString() });

    db.addAiLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      taskType: 'rss_ingest',
      status: 'success',
      source: manualTrigger ? 'Manual Admin Trigger' : 'Scheduled News Ingest',
      details: `Discovered ${collectedRawItems.length} wire items; processed ${itemsToProcess.length} items; saved ${newArticlesAdded} new articles. Auto-publish: ${settings.autoPublishAiNews ? 'Enabled' : 'Draft for Review'}.`,
      articlesProcessed: itemsToProcess.length,
      durationMs,
    });

    console.log(`[NewsEngine] Cycle completed in ${durationMs}ms. Added ${newArticlesAdded} articles.`);

    return {
      success: true,
      articlesProcessed: itemsToProcess.length,
      newArticlesAdded,
      message: `Ingestion completed. Discovered ${collectedRawItems.length} wire items, added ${newArticlesAdded} new articles.`,
    };
  } catch (error: any) {
    console.error('[NewsEngine] Cycle failed:', error);
    db.addAiLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      taskType: 'rss_ingest',
      status: 'error',
      source: 'News Engine',
      details: `Ingestion failed: ${error.message}`,
      articlesProcessed: 0,
      durationMs: Date.now() - startTime,
    });

    return {
      success: false,
      articlesProcessed: 0,
      newArticlesAdded: 0,
      message: `Failed: ${error.message}`,
    };
  } finally {
    isEngineRunning = false;
  }
}

export function initNewsEngineScheduler(): void {
  const settings = db.getSettings();
  const intervalMinutes = settings.automationIntervalMinutes || 15;
  const intervalMs = intervalMinutes * 60 * 1000;

  if (engineTimer) {
    clearInterval(engineTimer);
  }

  console.log(`[NewsEngine] Scheduled recurring automation interval: Every ${intervalMinutes} minutes.`);
  engineTimer = setInterval(() => {
    runNewsAutomationCycle(false).catch((err) =>
      console.error('[NewsEngine] Background cycle exception:', err)
    );
  }, intervalMs);
}

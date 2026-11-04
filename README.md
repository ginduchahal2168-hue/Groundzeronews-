# GROUND ZERO NEWS
> **Tagline:** Truth First. News Everywhere.  
> **Platform:** Production-grade AI-powered multilingual digital news network.

---

## 1. Overview
**Ground Zero News** is a next-generation international digital news platform designed for verified, high-impact journalism. Powered by Google Gemini AI, it automatically collects news from authorized wire sources and RSS feeds, deduplicates reporting clusters, synthesizes objective fact-checked summaries, and translates reports on demand across **19 global and regional languages** with full bidirectional script support (LTR and RTL).

The architecture is built API-first so that a single unified backend powers:
1. The Web Portal (Desktop, Tablet, Mobile)
2. Progressive Web App (PWA) with offline caching and home screen installability
3. Future Native Android Application (Kotlin / Jetpack Compose)
4. Future Native iOS Application (Swift / SwiftUI)

---

## 2. Key Architecture & Features

### A. Multilingual Reporting System (19 Languages)
Full support for native script typography, translation caching, and bidirectional RTL formatting:
1. **Punjabi (ਪੰਜਾਬੀ)**
2. **Hindi (हिन्दी)**
3. **English (English)**
4. **Assamese (অসমীয়া)**
5. **Bengali (বাংলা)**
6. **Tamil (தமிழ்)**
7. **Telugu (తెలుగు)**
8. **Malayalam (മലയാളം)**
9. **Kannada (ಕನ್ನಡ)**
10. **Marathi (मराठी)**
11. **Gujarati (ગુજરાતી)**
12. **Urdu (اردو)** *(RTL Layout)*
13. **French (Français)**
14. **Spanish (Español)**
15. **Arabic (العربية)** *(RTL Layout)*
16. **German (Deutsch)**
17. **Russian (Русский)**
18. **Chinese (中文)**
19. **Japanese (日本語)**

### B. AI Automatic News Engine (`gemini-3.8-flash`)
- **Automated RSS Aggregator:** Ingests live XML wire feeds from Reuters, AP, PTI, Tech Wire, Punjab Regional Dispatch, Assam Sentinel.
- **Deduplication Engine:** Compares incoming story vectors against existing headlines to prevent duplicates.
- **Zero-Hallucination Summarization:** Generates concise 2-3 paragraph summaries strictly derived from source facts.
- **Editorial Gatekeeping:** Allows instant publishing or strict manual review by human editors (`Draft / Pending Approval / Published`).
- **Configurable Scheduler:** Automated cycles can run every 5 minutes, 15 minutes, 30 minutes, 1 hour, or via manual triggers.
- **Audit Logs:** Full logging of execution timestamp, task type, processed counts, and latency.

### C. 23 Distinct News Categories
- Breaking News
- India News
- World News
- Punjab News
- Assam News
- Politics
- Business
- Economy
- Technology
- Artificial Intelligence
- Science
- Sports
- Entertainment
- Education
- Health
- Crime
- Defence
- Agriculture
- Weather
- Lifestyle
- Viral News
- Opinion
- Exclusive Reports

### D. Advanced Administrator Dashboard
- **Role-Based Access Control (RBAC):** Super Admin, Editor, Journalist, and Moderator roles.
- **Article Manager:** Create manual stories, approve AI-generated drafts, reject unverified wire claims, toggle breaking flags, delete.
- **Feed Manager:** Connect new RSS feeds, test connectivity, set default category, toggle active status.
- **Monetization & Ads:** Manage verified sponsor banners, tracking impressions and click-through rates.
- **SEO & Google News Hub:** Instant links to `/news-sitemap.xml`, `/sitemap.xml`, `/robots.txt`, `/api/rss.xml`, and PostgreSQL schema download.

### E. Individual Article Experience
- High-fidelity visual with legal photo attribution and caption.
- Verification badges: `CONFIRMED FACT-CHECKED` vs `DEVELOPING REPORT`.
- In-article language switcher: switch on the fly between 19 languages with live AI translation.
- Text-to-Speech audio reader player with adjustable playback speed (1.0x, 1.25x, 1.5x).
- Social sharing: WhatsApp, Telegram, X (Twitter), Facebook, Copy Link.
- Interactive reader discussion with civil moderation.
- Font size accessibility toggle (A- / A / A+).

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend:** Express full-stack API mounted with Vite middlewares in development.
- **AI Engine:** Google `@google/genai` TypeScript SDK (server-side, model `gemini-3.8-flash`).
- **Database:** Fully relational PostgreSQL / Supabase normalized schema (`src/db/schema.sql`) with Row Level Security (RLS), with local JSON persistence (`data/groundzero_db.json`) for seamless zero-setup execution.
- **PWA:** `vite-plugin-pwa` with web app manifest, maskable icons, service worker runtime caching, and in-app install prompts for Desktop, Android, and iOS Safari.
- **SEO:** Google News compliant `<news:news>` XML sitemap, standard XML sitemaps, robots.txt, and NewsArticle JSON-LD structured data.

---

## 4. Environment Variables (`.env`)

```env
# Required for AI News Summarization, Translation, and Deduplication
GEMINI_API_KEY="your-gemini-api-key"

# Deployed Service URL (injected automatically in AI Studio / Cloud Run)
APP_URL="https://groundzeronews.org"

# Server Port (default 3000)
PORT=3000

# (Optional) Remote Supabase credentials if scaling to hosted PostgreSQL
SUPABASE_URL="https://xyzcompany.supabase.co"
SUPABASE_ANON_KEY="eyJh..."
```

---

## 5. Development & Testing Instructions

### Run the Dev Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm start
```

### Type Checking & Linting
```bash
npm run lint
```

---

## 6. Future Android & iOS App Integration Guide

Ground Zero News was architected API-first. A future native mobile application can connect to the following REST endpoints:

### Endpoints
- `GET /api/news/articles?language=pa&category=Punjab%20News` : Retrieve localized news.
- `GET /api/news/articles/:id?language=hi` : Retrieve single localized article with body.
- `POST /api/news/translate-article` : Request on-demand AI translation for any of the 19 languages.
- `GET /api/feeds` : List active wire feeds.
- `GET /api/stats` : Retrieve platform traffic and category metrics.
- `POST /api/newsletter` : Subscribe to push or email alerts.
- `GET /api/rss.xml` : Standard RSS syndication feed.

### Kotlin (Android Jetpack Compose) Example
```kotlin
interface GroundZeroNewsApi {
    @GET("api/news/articles")
    suspend fun getArticles(
        @Query("language") language: String = "en",
        @Query("category") category: String? = null
    ): ArticleResponse

    @GET("api/news/articles/{id}")
    suspend fun getArticleDetail(
        @Path("id") articleId: String,
        @Query("language") language: String = "en"
    ): ArticleDetail
}
```

### Swift (iOS SwiftUI) Example
```swift
func fetchGroundZeroNews(language: String = "en") async throws -> [NewsArticle] {
    let url = URL(string: "https://groundzeronews.org/api/news/articles?language=\(language)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    let response = try JSONDecoder().decode(ArticleResponse.self, from: data)
    return response.articles
}
```

---

## 7. License & Credits
- **Brand:** Ground Zero News
- **Ethics Code:** Truth First. News Everywhere.
- **Wire Integrations:** Compliant with international fair-use wire synthesis standards.

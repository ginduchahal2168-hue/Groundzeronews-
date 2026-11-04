// server.ts
import express from "express";
import path2 from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// server/db.ts
import fs from "fs";
import path from "path";

// server/seedData.ts
var INITIAL_FEEDS = [
  {
    id: "feed-reuters-world",
    name: "Reuters World News",
    url: "https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en",
    category: "World News",
    language: "en",
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 1e3 * 60 * 12).toISOString(),
    itemsFetchedCount: 42,
    statusMessage: "Operational (200 OK)"
  },
  {
    id: "feed-india-national",
    name: "Press Trust of India / National Desk",
    url: "https://news.google.com/rss/headlines/section/topic/NATION?hl=en-IN&gl=IN&ceid=IN:en",
    category: "India News",
    language: "en",
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 1e3 * 60 * 15).toISOString(),
    itemsFetchedCount: 38,
    statusMessage: "Operational (200 OK)"
  },
  {
    id: "feed-tech-ai",
    name: "Ars Technica & Frontier Tech",
    url: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
    category: "Artificial Intelligence",
    language: "en",
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 1e3 * 60 * 20).toISOString(),
    itemsFetchedCount: 29,
    statusMessage: "Operational (200 OK)"
  },
  {
    id: "feed-economy-markets",
    name: "Global Financial & Trade Monitor",
    url: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
    category: "Economy",
    language: "en",
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 1e3 * 60 * 25).toISOString(),
    itemsFetchedCount: 31,
    statusMessage: "Operational (200 OK)"
  },
  {
    id: "feed-punjab-tribune",
    name: "Punjab Regional Dispatch",
    url: "https://news.google.com/rss/search?q=Punjab+news&hl=en-IN&gl=IN&ceid=IN:en",
    category: "Punjab News",
    language: "en",
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 1e3 * 60 * 35).toISOString(),
    itemsFetchedCount: 19,
    statusMessage: "Operational (200 OK)"
  },
  {
    id: "feed-assam-tribune",
    name: "Assam & Northeast Sentinel",
    url: "https://news.google.com/rss/search?q=Assam+Northeast+news&hl=en-IN&gl=IN&ceid=IN:en",
    category: "Assam News",
    language: "en",
    isActive: true,
    lastFetchedAt: new Date(Date.now() - 1e3 * 60 * 40).toISOString(),
    itemsFetchedCount: 16,
    statusMessage: "Operational (200 OK)"
  }
];
var INITIAL_ADMIN_USERS = [
  {
    id: "user-super-1",
    name: "Gurinder Singh",
    email: "editor-in-chief@groundzeronews.org",
    role: "super_admin",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "user-editor-1",
    name: "Aisha Al-Mansoor",
    email: "aisha.worlddesk@groundzeronews.org",
    role: "editor",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "user-journo-1",
    name: "Devraj Barua",
    email: "devraj.investigations@groundzeronews.org",
    role: "journalist",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  }
];
var INITIAL_SETTINGS = {
  siteName: "Ground Zero News",
  tagline: "Truth First. News Everywhere.",
  contactEmail: "contact@groundzeronews.org",
  automationIntervalMinutes: 15,
  autoPublishAiNews: false,
  // Default requires editorial review for safety!
  defaultLanguages: ["en", "pa", "hi", "ur", "bn", "ar", "fr", "es"],
  aiModelName: "gemini-3.8-flash",
  pushNotificationsEnabled: true,
  adSenseClientId: "ca-pub-9281726354182910",
  lastAutoRunAt: (/* @__PURE__ */ new Date()).toISOString()
};
var INITIAL_ADS = [
  {
    id: "ad-top-banner",
    title: "Global Satellite Intelligence Solutions",
    location: "header_banner",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=180&q=80",
    targetUrl: "https://groundzeronews.org/sponsor/satellite-intelligence",
    isActive: true,
    impressions: 12480,
    clicks: 432,
    sponsorName: "AeroGeo Systems",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  },
  {
    id: "ad-sidebar-1",
    title: "Secure Cloud Infrastructure for Newsrooms",
    location: "sidebar",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&h=400&q=80",
    targetUrl: "https://groundzeronews.org/sponsor/cloud-newsroom",
    isActive: true,
    impressions: 8940,
    clicks: 285,
    sponsorName: "QuantumCore Cloud",
    startDate: "2026-01-01",
    endDate: "2026-12-31"
  }
];
var INITIAL_ARTICLES = [
  {
    id: "gzn-lead-001",
    originalLanguage: "en",
    currentLanguage: "en",
    headline: "Global Clean Energy Treaty Ratified: 48 Nations Commit to Accelerated Grid Modernization by 2030",
    summary: "In an unprecedented multilateral diplomatic breakthrough in Geneva, 48 industrial and developing nations have signed the landmark Clean Grid Compact. The accord mandates verified cross-border power transmission standards and creates a $120 billion cooperative fund for high-voltage direct current interconnects, marking the fastest negotiated climate infrastructure framework in United Nations history.",
    fullBody: `GENEVA \u2014 Delegations from 48 member states formally ratified the Global Clean Grid Compact late Tuesday evening, concluding nine months of intense diplomatic negotiations. The accord is recognized by international observers as a pivotal shift from voluntary emission pledges toward binding physical infrastructure deployment.

The treaty establishes legally enforceable timelines for modernizing regional electric grids to absorb intermittent renewable energy. Notably, participating nations agreed to standardize ultra-high-voltage direct current (UHVDC) interconnectors, enabling surplus solar power from equatorial zones to transmit seamlessly into heavy industrial corridors across Eurasia and Africa.

Dr. Elena Rostova, Special Envoy for Energy Security, emphasized during the plenary session: "For decades, transition bottlenecks occurred not in generation, but in transmission capacity. Today's ratification removes bureaucratic tariffs on multinational clean power corridors and provides mutual stability against geopolitical energy shocks."

A dedicated $120 billion multilateral financing pool will underwrite early-stage interconnector engineering in South Asia, North Africa, and Eastern Europe, with initial disbursements scheduled for the second quarter of 2027. Sovereign debt guarantees provided by multilateral development banks will insulate recipient nations from currency fluctuations.`,
    category: "World News",
    tags: ["Energy Treaty", "Geneva Summit", "UHVDC", "Infrastructure", "Climate Accord"],
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Delegates gather in Geneva following the unanimous vote on the Clean Grid Modernization Compact.",
    imageCredit: "UN Press Corps / Associated Media / Public Domain",
    sourceName: "International News Pool / Geneva Bureau",
    sourceUrl: "https://www.reuters.com/sustainability",
    author: "Ground Zero Diplomatic Bureau",
    isAiGenerated: true,
    verificationStatus: "confirmed",
    status: "published",
    isBreaking: true,
    isFeatured: true,
    isTrending: true,
    viewCount: 18450,
    readingTimeMinutes: 4,
    publishedAt: new Date(Date.now() - 1e3 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1e3 * 60 * 45).toISOString(),
    commentsCount: 14,
    translations: {
      en: {
        language: "en",
        headline: "Global Clean Energy Treaty Ratified: 48 Nations Commit to Accelerated Grid Modernization by 2030",
        summary: "In an unprecedented multilateral diplomatic breakthrough in Geneva, 48 industrial and developing nations have signed the landmark Clean Grid Compact. The accord mandates verified cross-border power transmission standards and creates a $120 billion cooperative fund.",
        seoTitle: "Global Clean Energy Treaty Ratified: 48 Nations Modernize Grid by 2030",
        seoDescription: "48 nations sign the historic Clean Grid Compact in Geneva with a $120B fund for international power grids.",
        keywords: ["clean energy treaty", "geneva compact", "power grid 2030"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      pa: {
        language: "pa",
        headline: "\u0A17\u0A32\u0A4B\u0A2C\u0A32 \u0A15\u0A32\u0A40\u0A28 \u0A10\u0A28\u0A30\u0A1C\u0A40 \u0A38\u0A70\u0A27\u0A40 \u0A26\u0A40 \u0A2A\u0A41\u0A38\u0A3C\u0A1F\u0A40: 48 \u0A26\u0A47\u0A38\u0A3C\u0A3E\u0A02 \u0A28\u0A47 2030 \u0A24\u0A71\u0A15 \u0A17\u0A30\u0A3F\u0A71\u0A21 \u0A06\u0A27\u0A41\u0A28\u0A3F\u0A15\u0A40\u0A15\u0A30\u0A28 \u0A26\u0A3E \u0A32\u0A3F\u0A06 \u0A05\u0A39\u0A3F\u0A26",
        summary: "\u0A1C\u0A3F\u0A28\u0A40\u0A35\u0A3E \u0A35\u0A3F\u0A16\u0A47 \u0A07\u0A71\u0A15 \u0A07\u0A24\u0A3F\u0A39\u0A3E\u0A38\u0A15 \u0A2C\u0A39\u0A41-\u0A2A\u0A71\u0A16\u0A40 \u0A15\u0A42\u0A1F\u0A28\u0A40\u0A24\u0A15 \u0A38\u0A2B\u0A32\u0A24\u0A3E \u0A35\u0A3F\u0A71\u0A1A, 48 \u0A09\u0A26\u0A2F\u0A4B\u0A17\u0A3F\u0A15 \u0A05\u0A24\u0A47 \u0A35\u0A3F\u0A15\u0A3E\u0A38\u0A38\u0A3C\u0A40\u0A32 \u0A26\u0A47\u0A38\u0A3C\u0A3E\u0A02 \u0A28\u0A47 \u0A15\u0A32\u0A40\u0A28 \u0A17\u0A30\u0A3F\u0A71\u0A21 \u0A38\u0A2E\u0A1D\u0A4C\u0A24\u0A47 '\u0A24\u0A47 \u0A26\u0A38\u0A24\u0A16\u0A24 \u0A15\u0A40\u0A24\u0A47 \u0A39\u0A28\u0964 \u0A07\u0A39 \u0A38\u0A2E\u0A1D\u0A4C\u0A24\u0A3E \u0A38\u0A30\u0A39\u0A71\u0A26 \u0A2A\u0A3E\u0A30 \u0A2C\u0A3F\u0A1C\u0A32\u0A40 \u0A38\u0A70\u0A1A\u0A3E\u0A30 \u0A26\u0A47 \u0A2E\u0A3F\u0A06\u0A30 \u0A28\u0A3F\u0A30\u0A27\u0A3E\u0A30\u0A24 \u0A15\u0A30\u0A26\u0A3E \u0A39\u0A48 \u0A05\u0A24\u0A47 120 \u0A05\u0A30\u0A2C \u0A21\u0A3E\u0A32\u0A30 \u0A26\u0A3E \u0A2B\u0A70\u0A21 \u0A38\u0A25\u0A3E\u0A2A\u0A24 \u0A15\u0A30\u0A26\u0A3E \u0A39\u0A48\u0964",
        seoTitle: "\u0A15\u0A32\u0A40\u0A28 \u0A10\u0A28\u0A30\u0A1C\u0A40 \u0A38\u0A70\u0A27\u0A40: 48 \u0A26\u0A47\u0A38\u0A3C\u0A3E\u0A02 \u0A35\u0A71\u0A32\u0A4B\u0A02 \u0A17\u0A30\u0A3F\u0A71\u0A21 \u0A26\u0A3E \u0A06\u0A27\u0A41\u0A28\u0A3F\u0A15\u0A40\u0A15\u0A30\u0A28",
        seoDescription: "\u0A1C\u0A3F\u0A28\u0A40\u0A35\u0A3E \u0A35\u0A3F\u0A71\u0A1A 48 \u0A26\u0A47\u0A38\u0A3C\u0A3E\u0A02 \u0A28\u0A47 \u0A15\u0A32\u0A40\u0A28 \u0A17\u0A30\u0A3F\u0A71\u0A21 \u0A38\u0A2E\u0A1D\u0A4C\u0A24\u0A47 '\u0A24\u0A47 \u0A26\u0A38\u0A24\u0A16\u0A24 \u0A15\u0A40\u0A24\u0A47\u0964",
        keywords: ["\u0A38\u0A35\u0A71\u0A1B \u0A0A\u0A30\u0A1C\u0A3E", "\u0A1C\u0A3F\u0A28\u0A40\u0A35\u0A3E \u0A38\u0A2E\u0A1D\u0A4C\u0A24\u0A3E", "\u0A2C\u0A3F\u0A1C\u0A32\u0A40 \u0A17\u0A30\u0A3F\u0A71\u0A21"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      hi: {
        language: "hi",
        headline: "\u0935\u0948\u0936\u094D\u0935\u093F\u0915 \u0938\u094D\u0935\u091A\u094D\u091B \u090A\u0930\u094D\u091C\u093E \u0938\u0902\u0927\u093F \u092A\u0930 \u092E\u0941\u0939\u0930: 48 \u0926\u0947\u0936\u094B\u0902 \u0928\u0947 2030 \u0924\u0915 \u092A\u093E\u0935\u0930 \u0917\u094D\u0930\u093F\u0921 \u0906\u0927\u0941\u0928\u093F\u0915\u0940\u0915\u0930\u0923 \u0915\u093E \u0932\u093F\u092F\u093E \u0938\u0902\u0915\u0932\u094D\u092A",
        summary: "\u091C\u093F\u0928\u0947\u0935\u093E \u092E\u0947\u0902 \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0915\u0942\u091F\u0928\u0940\u0924\u093F\u0915 \u0938\u092B\u0932\u0924\u093E \u0915\u0947 \u0924\u0939\u0924 48 \u0926\u0947\u0936\u094B\u0902 \u0928\u0947 \u0932\u0948\u0902\u0921\u092E\u093E\u0930\u094D\u0915 \u0915\u094D\u0932\u0940\u0928 \u0917\u094D\u0930\u093F\u0921 \u0938\u092E\u091D\u094C\u0924\u0947 \u092A\u0930 \u0939\u0938\u094D\u0924\u093E\u0915\u094D\u0937\u0930 \u0915\u093F\u090F \u0939\u0948\u0902\u0964 \u092F\u0939 \u0938\u0902\u0927\u093F \u0938\u0940\u092E\u093E-\u092A\u093E\u0930 \u092C\u093F\u091C\u0932\u0940 \u092A\u093E\u0930\u0947\u0937\u0923 \u092E\u093E\u0928\u0915\u094B\u0902 \u0915\u094B \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u092C\u0928\u093E\u0924\u0940 \u0939\u0948 \u0914\u0930 120 \u0905\u0930\u092C \u0921\u0949\u0932\u0930 \u0915\u093E \u0938\u093E\u091D\u093E \u092B\u0902\u0921 \u0924\u0948\u092F\u093E\u0930 \u0915\u0930\u0924\u0940 \u0939\u0948\u0964",
        seoTitle: "\u0935\u0948\u0936\u094D\u0935\u093F\u0915 \u0938\u094D\u0935\u091A\u094D\u091B \u090A\u0930\u094D\u091C\u093E \u0938\u0902\u0927\u093F: 48 \u0926\u0947\u0936\u094B\u0902 \u0928\u0947 \u0917\u094D\u0930\u093F\u0921 \u0906\u0927\u0941\u0928\u093F\u0915\u0940\u0915\u0930\u0923 \u092A\u0930 \u0915\u093F\u090F \u0939\u0938\u094D\u0924\u093E\u0915\u094D\u0937\u0930",
        seoDescription: "\u091C\u093F\u0928\u0947\u0935\u093E \u092E\u0947\u0902 48 \u0926\u0947\u0936\u094B\u0902 \u0928\u0947 \u0915\u094D\u0932\u0940\u0928 \u0917\u094D\u0930\u093F\u0921 \u0938\u0902\u0927\u093F \u092A\u0930 \u0939\u0938\u094D\u0924\u093E\u0915\u094D\u0937\u0930 \u0915\u093F\u090F\u0964 120 \u0905\u0930\u092C \u0921\u0949\u0932\u0930 \u0915\u093E \u0915\u094B\u0937 \u0938\u094D\u0925\u093E\u092A\u093F\u0924\u0964",
        keywords: ["\u0938\u094D\u0935\u091A\u094D\u091B \u090A\u0930\u094D\u091C\u093E \u0938\u0902\u0927\u093F", "\u091C\u093F\u0928\u0947\u0935\u093E \u0938\u092E\u091D\u094C\u0924\u093E", "\u092A\u093E\u0935\u0930 \u0917\u094D\u0930\u093F\u0921"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      ur: {
        language: "ur",
        headline: "\u0639\u0627\u0644\u0645\u06CC \u0635\u0627\u0641 \u062A\u0648\u0627\u0646\u0627\u0626\u06CC \u0645\u0639\u0627\u06C1\u062F\u06D2 \u06A9\u06CC \u062A\u0648\u062B\u06CC\u0642: 48 \u0645\u0645\u0627\u0644\u06A9 \u06A9\u0627 2030 \u062A\u06A9 \u067E\u0627\u0648\u0631 \u06AF\u0631\u0688\u0632 \u06A9\u0648 \u062C\u062F\u06CC\u062F \u0628\u0646\u0627\u0646\u06D2 \u06A9\u0627 \u062A\u0627\u0631\u06CC\u062E\u06CC \u0639\u0632\u0645",
        summary: "\u062C\u0646\u06CC\u0648\u0627 \u0645\u06CC\u06BA \u0627\u06CC\u06A9 \u063A\u06CC\u0631 \u0645\u0639\u0645\u0648\u0644\u06CC \u0633\u0641\u0627\u0631\u062A\u06CC \u067E\u06CC\u0634 \u0631\u0641\u062A \u0645\u06CC\u06BA 48 \u0635\u0646\u0639\u062A\u06CC \u0648 \u062A\u0631\u0642\u06CC \u067E\u0630\u06CC\u0631 \u0645\u0645\u0627\u0644\u06A9 \u0646\u06D2 \u062A\u0627\u0631\u06CC\u062E\u06CC \u06A9\u0644\u06CC\u0646 \u06AF\u0631\u0688 \u0645\u0639\u0627\u06C1\u062F\u06D2 \u067E\u0631 \u062F\u0633\u062A\u062E\u0637 \u06A9\u0631 \u062F\u06CC\u06D2 \u06C1\u06CC\u06BA\u06D4 \u06CC\u06C1 \u0645\u0639\u0627\u06C1\u062F\u06C1 \u0633\u0631\u062D\u062F \u067E\u0627\u0631 \u0628\u062C\u0644\u06CC \u062A\u0631\u0633\u06CC\u0644 \u06A9\u06D2 \u0645\u0639\u06CC\u0627\u0631 \u0637\u06D2 \u06A9\u0631\u062A\u0627 \u06C1\u06D2 \u0627\u0648\u0631 120 \u0627\u0631\u0628 \u0688\u0627\u0644\u0631 \u06A9\u0627 \u0641\u0646\u0688 \u0642\u0627\u0626\u0645 \u06A9\u0631\u062A\u0627 \u06C1\u06D2\u06D4",
        seoTitle: "\u0639\u0627\u0644\u0645\u06CC \u06A9\u0644\u06CC\u0646 \u0627\u0646\u0631\u062C\u06CC \u0645\u0639\u0627\u06C1\u062F\u06C1: 48 \u0645\u0645\u0627\u0644\u06A9 \u06A9\u06CC \u062A\u0627\u0631\u06CC\u062E\u06CC \u062A\u0648\u062B\u06CC\u0642",
        seoDescription: "\u062C\u0646\u06CC\u0648\u0627 \u0645\u06CC\u06BA 48 \u0645\u0645\u0627\u0644\u06A9 \u0646\u06D2 \u067E\u0627\u0648\u0631 \u06AF\u0631\u0688 \u062C\u062F\u06CC\u062F \u06A9\u0627\u0631\u06CC \u06A9\u06D2 \u062A\u0627\u0631\u06CC\u062E\u06CC \u0645\u0639\u0627\u06C1\u062F\u06D2 \u06A9\u06CC \u062A\u0648\u062B\u06CC\u0642 \u06A9\u0631 \u062F\u06CC\u06D4",
        keywords: ["\u0635\u0627\u0641 \u062A\u0648\u0627\u0646\u0627\u0626\u06CC", "\u062C\u0646\u06CC\u0648\u0627 \u06A9\u0627\u0646\u0641\u0631\u0646\u0633", "\u067E\u0627\u0648\u0631 \u06AF\u0631\u0688 \u0645\u0639\u0627\u06C1\u062F\u06C1"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      ar: {
        language: "ar",
        headline: "\u0627\u0644\u062A\u0635\u062F\u064A\u0642 \u0639\u0644\u0649 \u0645\u0639\u0627\u0647\u062F\u0629 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0646\u0638\u064A\u0641\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629: 48 \u062F\u0648\u0644\u0629 \u062A\u062A\u0639\u0647\u062F \u0628\u062A\u062D\u062F\u064A\u062B \u0634\u0628\u0643\u0627\u062A \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0628\u062D\u0644\u0648\u0644 \u0639\u0627\u0645 2030",
        summary: "\u0641\u064A \u0627\u062E\u062A\u0631\u0627\u0642 \u062F\u0628\u0644\u0648\u0645\u0627\u0633\u064A \u063A\u064A\u0631 \u0645\u0633\u0628\u0648\u0642 \u0641\u064A \u062C\u0646\u064A\u0641\u060C \u0648\u0642\u0639\u062A 48 \u062F\u0648\u0644\u0629 \u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0646\u0627\u0645\u064A\u0629 \u0639\u0644\u0649 \u0627\u062A\u0641\u0627\u0642\u064A\u0629 \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0646\u0638\u064A\u0641\u0629 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629\u060C \u0648\u0627\u0644\u062A\u064A \u062A\u0646\u0634\u0626 \u0635\u0646\u062F\u0648\u0642\u0627\u064B \u062A\u0639\u0627\u0648\u0646\u064A\u0627\u064B \u0628\u0642\u064A\u0645\u0629 120 \u0645\u0644\u064A\u0627\u0631 \u062F\u0648\u0644\u0627\u0631 \u0644\u0631\u0628\u0637 \u0634\u0628\u0643\u0627\u062A \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0627\u0644\u0639\u0627\u0628\u0631\u0629 \u0644\u0644\u062D\u062F\u0648\u062F.",
        seoTitle: "\u0645\u0639\u0627\u0647\u062F\u0629 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0646\u0638\u064A\u0641\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629: 48 \u062F\u0648\u0644\u0629 \u062A\u0648\u0642\u0639 \u0627\u062A\u0641\u0627\u0642\u064A\u0629 \u062A\u0627\u0631\u064A\u062E\u064A\u0629",
        seoDescription: "\u062A\u0648\u0642\u064A\u0639 \u0645\u0639\u0627\u0647\u062F\u0629 \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0646\u0638\u064A\u0641\u0629 \u0641\u064A \u062C\u0646\u064A\u0641 \u0628\u0645\u0634\u0627\u0631\u0643\u0629 48 \u062F\u0648\u0644\u0629 \u0648\u0635\u0646\u062F\u0648\u0642 \u062A\u0645\u0648\u064A\u0644 \u0628\u0640 120 \u0645\u0644\u064A\u0627\u0631 \u062F\u0648\u0644\u0627\u0631.",
        keywords: ["\u0637\u0627\u0642\u0629 \u0646\u0638\u064A\u0641\u0629", "\u0642\u0645\u0629 \u062C\u0646\u064A\u0641", "\u0634\u0628\u0643\u0627\u062A \u0643\u0647\u0631\u0628\u0627\u0626\u064A\u0629"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      bn: {
        language: "bn",
        headline: "\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09AA\u09B0\u09BF\u099A\u09CD\u099B\u09A8\u09CD\u09A8 \u099C\u09CD\u09AC\u09BE\u09B2\u09BE\u09A8\u09BF \u099A\u09C1\u0995\u09CD\u09A4\u09BF \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8: \u09E8\u09E6\u09E9\u09E6 \u09B8\u09BE\u09B2\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u0997\u09CD\u09B0\u09BF\u09A1 \u0986\u09A7\u09C1\u09A8\u09BF\u0995\u09BE\u09AF\u09BC\u09A8\u09C7 \u09EA\u09EE \u09A6\u09C7\u09B6\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09B6\u09CD\u09B0\u09C1\u09A4\u09BF",
        summary: "\u099C\u09C7\u09A8\u09C7\u09AD\u09BE\u09AF\u09BC \u098F\u0995\u099F\u09BF \u0990\u09A4\u09BF\u09B9\u09BE\u09B8\u09BF\u0995 \u09AC\u09B9\u09C1\u09AA\u09BE\u0995\u09CD\u09B7\u09BF\u0995 \u0995\u09C2\u099F\u09A8\u09C8\u09A4\u09BF\u0995 \u0985\u0997\u09CD\u09B0\u0997\u09A4\u09BF\u09A4\u09C7 \u09EA\u09EE\u099F\u09BF \u09B6\u09BF\u09B2\u09CD\u09AA\u09CB\u09A8\u09CD\u09A8\u09A4 \u0993 \u0989\u09A8\u09CD\u09A8\u09AF\u09BC\u09A8\u09B6\u09C0\u09B2 \u09A6\u09C7\u09B6 \u09AF\u09C1\u0997\u09BE\u09A8\u09CD\u09A4\u0995\u09BE\u09B0\u09C0 \u0995\u09CD\u09B2\u09BF\u09A8 \u0997\u09CD\u09B0\u09BF\u09A1 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09A4\u09C7 \u09B8\u09CD\u09AC\u09BE\u0995\u09CD\u09B7\u09B0 \u0995\u09B0\u09C7\u099B\u09C7\u0964 \u098F\u0987 \u099A\u09C1\u0995\u09CD\u09A4\u09BF \u09E7\u09E8\u09E6 \u09AC\u09BF\u09B2\u09BF\u09AF\u09BC\u09A8 \u09A1\u09B2\u09BE\u09B0\u09C7\u09B0 \u09B8\u09B9\u09AF\u09CB\u0997\u09C0 \u09A4\u09B9\u09AC\u09BF\u09B2 \u0997\u09A0\u09A8\u09C7\u09B0 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6 \u09A6\u09C7\u09AF\u09BC\u0964",
        seoTitle: "\u09AA\u09B0\u09BF\u099A\u09CD\u099B\u09A8\u09CD\u09A8 \u099C\u09CD\u09AC\u09BE\u09B2\u09BE\u09A8\u09BF \u099A\u09C1\u0995\u09CD\u09A4\u09BF: \u09E8\u09E6\u09E9\u09E6 \u09B8\u09BE\u09B2\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u0997\u09CD\u09B0\u09BF\u09A1 \u0986\u09A7\u09C1\u09A8\u09BF\u0995\u09BE\u09AF\u09BC\u09A8",
        seoDescription: "\u099C\u09C7\u09A8\u09C7\u09AD\u09BE\u09AF\u09BC \u09EA\u09EE \u09A6\u09C7\u09B6\u09C7\u09B0 \u09B8\u09CD\u09AC\u09BE\u0995\u09CD\u09B7\u09B0\u09C7 \u0995\u09CD\u09B2\u09BF\u09A8 \u0997\u09CD\u09B0\u09BF\u09A1 \u099A\u09C1\u0995\u09CD\u09A4\u09BF \u09B8\u09CD\u09AC\u09BE\u0995\u09CD\u09B7\u09B0\u09BF\u09A4\u0964",
        keywords: ["\u099C\u09CD\u09AC\u09BE\u09B2\u09BE\u09A8\u09BF \u099A\u09C1\u0995\u09CD\u09A4\u09BF", "\u099C\u09C7\u09A8\u09C7\u09AD\u09BE \u09B8\u09AE\u09CD\u09AE\u09C7\u09B2\u09A8", "\u09AC\u09BF\u09A6\u09CD\u09AF\u09C1\u09CE \u0997\u09CD\u09B0\u09BF\u09A1"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  },
  {
    id: "gzn-lead-002",
    originalLanguage: "en",
    currentLanguage: "en",
    headline: "Frontier AI Reasoning Models Achieve Breakthrough in Quantum Chemical Catalyst Discovery",
    summary: "Computational chemistry institutes in Cambridge and Bangalore have announced the autonomous discovery of an earth-abundant nickel-iron catalyst for room-temperature water splitting, designed and validated in record time using novel neural reasoning architectures.",
    fullBody: `CAMBRIDGE / BANGALORE \u2014 Joint research teams at the Advanced Materials Synthesis Laboratory have demonstrated the first fully autonomous molecular discovery of an ultra-stable water-splitting catalyst utilizing frontier neural reasoning models.

The catalyst, synthesized primarily from nickel, iron, and trace manganese, achieves an overpotential of just 180 millivolts at high current densities\u2014surpassing precious-metal benchmarks like iridium and platinum by nearly forty percent while costing less than three percent of conventional commercial catalysts.

The breakthrough is notable because the AI architecture was instructed only with foundational Schr\xF6dinger equations and thermodynamics principles, evaluating over 4.2 million combinatorial lattices in under 72 hours before synthesizing the winning candidate on robotic laboratory carousels.

Industrial production trials are already scheduled in partnership with clean hydrogen refineries in Gujarat and Rotterdam. Commercial deployment is projected to compress electrolyzer operational costs by thirty-five percent over the next decade.`,
    category: "Artificial Intelligence",
    tags: ["AI Chemistry", "Quantum Catalysis", "Green Hydrogen", "Neural Models", "DeepTech"],
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Molecular modeling lattice visualizing the AI-designed nickel-iron organometallic structure.",
    imageCredit: "Computational Materials Archive / CC-BY-4.0",
    sourceName: "Science & Advanced Tech Journal",
    sourceUrl: "https://www.nature.com/materials",
    author: "Ground Zero Science Desk",
    isAiGenerated: true,
    verificationStatus: "confirmed",
    status: "published",
    isBreaking: false,
    isFeatured: true,
    isTrending: true,
    viewCount: 14210,
    readingTimeMinutes: 3,
    publishedAt: new Date(Date.now() - 1e3 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1e3 * 60 * 90).toISOString(),
    commentsCount: 9,
    translations: {
      en: {
        language: "en",
        headline: "Frontier AI Reasoning Models Achieve Breakthrough in Quantum Chemical Catalyst Discovery",
        summary: "Autonomous discovery of an earth-abundant nickel-iron catalyst for room-temperature water splitting, designed in record time using neural reasoning architectures.",
        seoTitle: "AI Breakthrough in Quantum Chemical Catalyst Discovery",
        seoDescription: "Researchers design affordable water-splitting catalyst in record 72 hours using AI reasoning.",
        keywords: ["quantum catalyst", "AI chemistry", "clean hydrogen"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      pa: {
        language: "pa",
        headline: "\u0A06\u0A30\u0A1F\u0A40\u0A2B\u0A40\u0A38\u0A3C\u0A40\u0A05\u0A32 \u0A07\u0A70\u0A1F\u0A48\u0A32\u0A40\u0A1C\u0A48\u0A02\u0A38 \u0A26\u0A40 \u0A35\u0A71\u0A21\u0A40 \u0A2A\u0A4D\u0A30\u0A3E\u0A2A\u0A24\u0A40: \u0A15\u0A48\u0A2E\u0A40\u0A15\u0A32 \u0A09\u0A24\u0A2A\u0A4D\u0A30\u0A47\u0A30\u0A15 \u0A26\u0A40 \u0A16\u0A4B\u0A1C \u0A28\u0A3E\u0A32 \u0A17\u0A4D\u0A30\u0A40\u0A28 \u0A39\u0A3E\u0A08\u0A21\u0A4D\u0A30\u0A4B\u0A1C\u0A28 \u0A39\u0A4B\u0A35\u0A47\u0A17\u0A40 \u0A38\u0A38\u0A24\u0A40",
        summary: "\u0A15\u0A48\u0A02\u0A2C\u0A30\u0A3F\u0A1C \u0A05\u0A24\u0A47 \u0A2C\u0A70\u0A17\u0A32\u0A41\u0A30\u0A42 \u0A26\u0A40\u0A06\u0A02 \u0A16\u0A4B\u0A1C \u0A1F\u0A40\u0A2E\u0A3E\u0A02 \u0A28\u0A47 \u0A28\u0A3F\u0A0A\u0A30\u0A32 \u0A2E\u0A3E\u0A21\u0A32\u0A3E\u0A02 \u0A26\u0A40 \u0A35\u0A30\u0A24\u0A4B\u0A02 \u0A15\u0A30\u0A15\u0A47 \u0A2A\u0A3E\u0A23\u0A40 \u0A28\u0A42\u0A70 \u0A24\u0A4B\u0A5C\u0A28 \u0A35\u0A3E\u0A32\u0A47 \u0A07\u0A71\u0A15 \u0A2C\u0A39\u0A41\u0A24 \u0A39\u0A40 \u0A38\u0A38\u0A24\u0A47 \u0A28\u0A3F\u0A71\u0A15\u0A32-\u0A06\u0A07\u0A30\u0A28 \u0A15\u0A48\u0A1F\u0A3E\u0A32\u0A3F\u0A38\u0A1F \u0A26\u0A40 \u0A16\u0A4B\u0A1C \u0A15\u0A40\u0A24\u0A40 \u0A39\u0A48\u0964",
        seoTitle: "\u0A0F\u0A06\u0A08 \u0A35\u0A71\u0A32\u0A4B\u0A02 \u0A28\u0A35\u0A47\u0A02 \u0A15\u0A48\u0A1F\u0A3E\u0A32\u0A3F\u0A38\u0A1F \u0A26\u0A40 \u0A16\u0A4B\u0A1C",
        seoDescription: "\u0A0F\u0A06\u0A08 \u0A2E\u0A3E\u0A21\u0A32\u0A3E\u0A02 \u0A28\u0A47 \u0A17\u0A4D\u0A30\u0A40\u0A28 \u0A39\u0A3E\u0A08\u0A21\u0A4D\u0A30\u0A4B\u0A1C\u0A28 \u0A32\u0A08 \u0A38\u0A38\u0A24\u0A3E \u0A09\u0A24\u0A2A\u0A4D\u0A30\u0A47\u0A30\u0A15 \u0A32\u0A71\u0A2D\u0A3F\u0A06\u0964",
        keywords: ["\u0A0F\u0A06\u0A08 \u0A16\u0A4B\u0A1C", "\u0A38\u0A35\u0A71\u0A1B \u0A0A\u0A30\u0A1C\u0A3E", "\u0A17\u0A4D\u0A30\u0A40\u0A28 \u0A39\u0A3E\u0A08\u0A21\u0A4D\u0A30\u0A4B\u0A1C\u0A28"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      hi: {
        language: "hi",
        headline: "\u0906\u0930\u094D\u091F\u093F\u092B\u093F\u0936\u093F\u092F\u0932 \u0907\u0902\u091F\u0947\u0932\u093F\u091C\u0947\u0902\u0938 \u0915\u0940 \u092C\u0921\u093C\u0940 \u0915\u093E\u092E\u092F\u093E\u092C\u0940: \u0915\u094D\u0935\u093E\u0902\u091F\u092E \u0915\u0947\u092E\u093F\u0938\u094D\u091F\u094D\u0930\u0940 \u092E\u0947\u0902 \u0928\u090F \u0915\u0948\u091F\u0947\u0932\u093F\u0938\u094D\u091F \u0915\u0940 \u0938\u094D\u0935\u093E\u092F\u0924\u094D\u0924 \u0916\u094B\u091C",
        summary: "\u0915\u0948\u092E\u094D\u092C\u094D\u0930\u093F\u091C \u0914\u0930 \u092C\u0947\u0902\u0917\u0932\u0941\u0930\u0941 \u0915\u0947 \u0935\u0948\u091C\u094D\u091E\u093E\u0928\u093F\u0915\u094B\u0902 \u0928\u0947 \u0928\u094D\u092F\u0942\u0930\u0932 \u0930\u0940\u091C\u0928\u093F\u0902\u0917 \u092E\u0949\u0921\u0932 \u0915\u0947 \u091C\u0930\u093F\u090F \u090F\u0915 \u092C\u0947\u0939\u0926 \u0915\u093F\u092B\u093E\u092F\u0924\u0940 \u0928\u093F\u0915\u0932-\u0906\u092F\u0930\u0928 \u0909\u0924\u094D\u092A\u094D\u0930\u0947\u0930\u0915 \u0924\u0948\u092F\u093E\u0930 \u0915\u093F\u092F\u093E \u0939\u0948 \u091C\u094B \u0938\u094D\u0935\u091A\u094D\u091B \u0939\u093E\u0907\u0921\u094D\u0930\u094B\u091C\u0928 \u0909\u0924\u094D\u092A\u093E\u0926\u0928 \u0915\u094B \u0915\u094D\u0930\u093E\u0902\u0924\u093F\u0915\u093E\u0930\u0940 \u0917\u0924\u093F \u0926\u0947\u0917\u093E\u0964",
        seoTitle: "\u090F\u0906\u0908 \u0928\u0947 \u0916\u094B\u091C\u093E \u0939\u0930\u093F\u0924 \u0939\u093E\u0907\u0921\u094D\u0930\u094B\u091C\u0928 \u0915\u0947 \u0932\u093F\u090F \u0915\u094D\u0930\u093E\u0902\u0924\u093F\u0915\u093E\u0930\u0940 \u0915\u0948\u091F\u0947\u0932\u093F\u0938\u094D\u091F",
        seoDescription: "\u090F\u0906\u0908 \u0930\u0940\u091C\u0928\u093F\u0902\u0917 \u092E\u0949\u0921\u0932 \u0928\u0947 72 \u0918\u0902\u091F\u0947 \u092E\u0947\u0902 \u092A\u093E\u0928\u0940 \u0915\u094B \u0935\u093F\u092D\u093E\u091C\u093F\u0924 \u0915\u0930\u0928\u0947 \u0935\u093E\u0932\u093E \u0938\u0938\u094D\u0924\u093E \u0909\u0924\u094D\u092A\u094D\u0930\u0947\u0930\u0915 \u0935\u093F\u0915\u0938\u093F\u0924 \u0915\u093F\u092F\u093E\u0964",
        keywords: ["\u090F\u0906\u0908 \u0915\u0948\u091F\u0947\u0932\u093F\u0938\u094D\u091F", "\u0939\u0930\u093F\u0924 \u0939\u093E\u0907\u0921\u094D\u0930\u094B\u091C\u0928", "\u0915\u094D\u0935\u093E\u0902\u091F\u092E \u0916\u094B\u091C"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  },
  {
    id: "gzn-lead-003",
    originalLanguage: "en",
    currentLanguage: "en",
    headline: "Punjab Unveils Direct Seeded Rice and Solar Tube-Well Incentive Package to Rejuvenate Water Table",
    summary: "The Punjab state government has rolled out a comprehensive \u20B92,400 crore agrarian package, providing direct financial incentives of \u20B94,000 per acre for farmers adopting Direct Seeded Rice (DSR) technology and solarized micro-drip irrigation across 18 sensitive canal commands.",
    fullBody: `CHANDIGARH \u2014 In a decisive structural policy move to tackle the depletion of subterranean aquifers across the Malwa and Majha belts, the Punjab administration announced the "Kisan Jal Suraksha Mission."

The comprehensive package grants immediate direct-benefit transfers to cultivators transitioning away from traditional flood irrigation toward direct seeding methods and laser levelling. Under the plan, an initial tranche of 45,000 agricultural tube-wells will be converted to grid-interactive solar pump arrays equipped with automated soil moisture probes.

Agricultural economists welcomed the initiative, highlighting that direct seeded paddy saves up to thirty-five percent of water while cutting electricity consumption on state grids. The policy also features dedicated MSP bonuses for diversified oilseeds, pulses, and maize crops planted along canal boundaries.

Speaking in Ludhiana, Punjab Agricultural University scientists stated: "By aligning scientific agronomy with immediate economic rewards for farmers, Punjab is creating a replicable model of sustainable food sovereignty for the entire Indo-Gangetic plain."`,
    category: "Punjab News",
    tags: ["Punjab Agriculture", "Water Conservation", "DSR Farming", "Solar Tube Wells", "Chandigarh"],
    imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Lush paddy fields in Punjab under sustainable direct-seeded water-conservation trials.",
    imageCredit: "Punjab Agri Bureau / Press Information Desk",
    sourceName: "Punjab Regional Dispatch / Chandigarh Bureau",
    sourceUrl: "https://punjab.gov.in/agriculture",
    author: "Ground Zero Agrarian Desk",
    isAiGenerated: true,
    verificationStatus: "confirmed",
    status: "published",
    isBreaking: false,
    isFeatured: true,
    isTrending: true,
    viewCount: 16890,
    readingTimeMinutes: 4,
    publishedAt: new Date(Date.now() - 1e3 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1e3 * 60 * 120).toISOString(),
    commentsCount: 22,
    translations: {
      en: {
        language: "en",
        headline: "Punjab Unveils Direct Seeded Rice and Solar Tube-Well Incentive Package to Rejuvenate Water Table",
        summary: "The Punjab administration rolled out a \u20B92,400 crore agrarian package offering \u20B94,000 per acre for farmers adopting Direct Seeded Rice (DSR) and solarized micro-drip systems.",
        seoTitle: "Punjab Agrarian Package: DSR Farming & Solar Tube-Wells",
        seoDescription: "Punjab launches \u20B92,400 crore package with \u20B94,000/acre incentives to restore ground water through DSR farming.",
        keywords: ["Punjab farming", "DSR rice", "water conservation Punjab"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      pa: {
        language: "pa",
        headline: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C \u0A38\u0A30\u0A15\u0A3E\u0A30 \u0A35\u0A71\u0A32\u0A4B\u0A02 \u0A27\u0A30\u0A24\u0A40 \u0A39\u0A47\u0A20\u0A32\u0A47 \u0A2A\u0A3E\u0A23\u0A40 \u0A28\u0A42\u0A70 \u0A2C\u0A1A\u0A3E\u0A09\u0A23 \u0A32\u0A08 2400 \u0A15\u0A30\u0A4B\u0A5C \u0A30\u0A41\u0A2A\u0A0F \u0A26\u0A47 \u0A2A\u0A48\u0A15\u0A47\u0A1C \u0A26\u0A3E \u0A10\u0A32\u0A3E\u0A28: \u0A1D\u0A4B\u0A28\u0A47 \u0A26\u0A40 \u0A38\u0A3F\u0A71\u0A27\u0A40 \u0A2C\u0A3F\u0A1C\u0A3E\u0A08 \u0A32\u0A08 4000 \u0A30\u0A41\u0A2A\u0A0F \u0A2A\u0A4D\u0A30\u0A24\u0A40 \u0A0F\u0A15\u0A5C",
        summary: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C \u0A38\u0A30\u0A15\u0A3E\u0A30 \u0A28\u0A47 \u0A2E\u0A3E\u0A32\u0A35\u0A3E \u0A05\u0A24\u0A47 \u0A2E\u0A3E\u0A1D\u0A3E \u0A16\u0A47\u0A24\u0A30 \u0A35\u0A3F\u0A71\u0A1A \u0A27\u0A30\u0A24\u0A40 \u0A39\u0A47\u0A20\u0A32\u0A47 \u0A2A\u0A3E\u0A23\u0A40 \u0A26\u0A47 \u0A21\u0A3F\u0A71\u0A17 \u0A30\u0A39\u0A47 \u0A2A\u0A71\u0A27\u0A30 \u0A28\u0A42\u0A70 \u0A2C\u0A1A\u0A3E\u0A09\u0A23 \u0A32\u0A08 \u0A15\u0A3F\u0A38\u0A3E\u0A28 \u0A1C\u0A32 \u0A38\u0A41\u0A30\u0A71\u0A16\u0A3F\u0A06 \u0A2E\u0A3F\u0A38\u0A3C\u0A28 \u0A38\u0A3C\u0A41\u0A30\u0A42 \u0A15\u0A40\u0A24\u0A3E \u0A39\u0A48\u0964 \u0A21\u0A40.\u0A10\u0A38.\u0A06\u0A30. \u0A24\u0A15\u0A28\u0A40\u0A15 \u0A05\u0A2A\u0A23\u0A3E\u0A09\u0A23 \u0A35\u0A3E\u0A32\u0A47 \u0A15\u0A3F\u0A38\u0A3E\u0A28\u0A3E\u0A02 \u0A28\u0A42\u0A70 \u0A38\u0A3F\u0A71\u0A27\u0A40 \u0A35\u0A3F\u0A71\u0A24\u0A40 \u0A38\u0A39\u0A3E\u0A07\u0A24\u0A3E \u0A05\u0A24\u0A47 \u0A38\u0A4B\u0A32\u0A30 \u0A1F\u0A3F\u0A0A\u0A2C\u0A35\u0A48\u0A71\u0A32 \u0A2E\u0A41\u0A39\u0A71\u0A08\u0A06 \u0A15\u0A30\u0A35\u0A3E\u0A0F \u0A1C\u0A3E\u0A23\u0A17\u0A47\u0964",
        seoTitle: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C \u0A16\u0A47\u0A24\u0A40\u0A2C\u0A3E\u0A5C\u0A40 \u0A2A\u0A48\u0A15\u0A47\u0A1C: \u0A1D\u0A4B\u0A28\u0A47 \u0A26\u0A40 \u0A38\u0A3F\u0A71\u0A27\u0A40 \u0A2C\u0A3F\u0A1C\u0A3E\u0A08 \u0A05\u0A24\u0A47 \u0A38\u0A4B\u0A32\u0A30 \u0A2A\u0A70\u0A2A",
        seoDescription: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C \u0A38\u0A30\u0A15\u0A3E\u0A30 \u0A28\u0A47 \u0A2A\u0A3E\u0A23\u0A40 \u0A26\u0A40 \u0A38\u0A70\u0A2D\u0A3E\u0A32 \u0A32\u0A08 4000 \u0A30\u0A41\u0A2A\u0A0F \u0A2A\u0A4D\u0A30\u0A24\u0A40 \u0A0F\u0A15\u0A5C \u0A26\u0A40 \u0A38\u0A2C\u0A38\u0A3F\u0A21\u0A40 \u0A26\u0A3E \u0A10\u0A32\u0A3E\u0A28 \u0A15\u0A40\u0A24\u0A3E\u0964",
        keywords: ["\u0A2A\u0A70\u0A1C\u0A3E\u0A2C \u0A16\u0A47\u0A24\u0A40\u0A2C\u0A3E\u0A5C\u0A40", "\u0A38\u0A3F\u0A71\u0A27\u0A40 \u0A2C\u0A3F\u0A1C\u0A3E\u0A08", "\u0A2A\u0A3E\u0A23\u0A40 \u0A26\u0A40 \u0A38\u0A70\u0A2D\u0A3E\u0A32", "\u0A1A\u0A70\u0A21\u0A40\u0A17\u0A5C\u0A4D\u0A39"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      hi: {
        language: "hi",
        headline: "\u092A\u0902\u091C\u093E\u092C \u0938\u0930\u0915\u093E\u0930 \u0915\u093E \u092C\u0921\u093C\u093E \u092B\u0948\u0938\u0932\u093E: \u092D\u0942\u091C\u0932 \u0938\u0902\u0930\u0915\u094D\u0937\u0923 \u0915\u0947 \u0932\u093F\u090F 2,400 \u0915\u0930\u094B\u0921\u093C \u0915\u093E \u092A\u0948\u0915\u0947\u091C, \u0938\u0940\u0927\u0940 \u092C\u0941\u0935\u093E\u0908 \u092A\u0930 4,000 \u0930\u0941\u092A\u092F\u0947 \u092A\u094D\u0930\u0924\u093F \u090F\u0915\u0921\u093C \u092A\u094D\u0930\u094B\u0924\u094D\u0938\u093E\u0939\u0928",
        summary: "\u092A\u0902\u091C\u093E\u092C \u0915\u0947 \u0915\u093F\u0938\u093E\u0928\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0938\u0940\u0927\u0940 \u0927\u093E\u0928 \u092C\u0941\u0935\u093E\u0908 (DSR) \u0914\u0930 \u0938\u094C\u0930 \u090A\u0930\u094D\u091C\u093E \u091A\u093E\u0932\u093F\u0924 \u091F\u094D\u092F\u0942\u092C\u0935\u0947\u0932 \u0915\u094B \u092C\u0922\u093C\u093E\u0935\u093E \u0926\u0947\u0928\u0947 \u0939\u0947\u0924\u0941 \u0935\u093F\u0936\u0947\u0937 \u092A\u0948\u0915\u0947\u091C \u0915\u0940 \u0918\u094B\u0937\u0923\u093E \u0915\u0940 \u0917\u0908 \u0939\u0948, \u091C\u093F\u0938\u0938\u0947 \u0930\u093E\u091C\u094D\u092F \u092E\u0947\u0902 \u0917\u093F\u0930\u0924\u0947 \u092D\u0942\u091C\u0932 \u0938\u094D\u0924\u0930 \u0915\u094B \u0925\u093E\u092E\u093E \u091C\u093E \u0938\u0915\u0947\u0964",
        seoTitle: "\u092A\u0902\u091C\u093E\u092C \u0938\u0930\u0915\u093E\u0930 \u0915\u093E \u092D\u0942\u091C\u0932 \u0938\u0902\u0930\u0915\u094D\u0937\u0923 \u092A\u0948\u0915\u0947\u091C: \u0927\u093E\u0928 \u0915\u0940 \u0938\u0940\u0927\u0940 \u092C\u0941\u0935\u093E\u0908 \u092A\u0930 \u0905\u0928\u0941\u0926\u093E\u0928",
        seoDescription: "\u092A\u0902\u091C\u093E\u092C \u0928\u0947 \u0927\u093E\u0928 \u0915\u0940 \u0938\u0940\u0927\u0940 \u092C\u0941\u0935\u093E\u0908 \u0914\u0930 \u0938\u094B\u0932\u0930 \u092A\u0902\u092A\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F 2400 \u0915\u0930\u094B\u0921\u093C \u0930\u0941\u092A\u092F\u0947 \u0915\u093E \u0930\u093E\u0939\u0924 \u092A\u0948\u0915\u0947\u091C \u0918\u094B\u0937\u093F\u0924 \u0915\u093F\u092F\u093E\u0964",
        keywords: ["\u092A\u0902\u091C\u093E\u092C \u0915\u0943\u0937\u093F", "\u0921\u0940\u090F\u0938\u0906\u0930 \u0924\u0915\u0928\u0940\u0915", "\u092D\u0942\u091C\u0932 \u0938\u0902\u0930\u0915\u094D\u0937\u0923"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  },
  {
    id: "gzn-lead-004",
    originalLanguage: "en",
    currentLanguage: "en",
    headline: "Assam Expands Brahmaputra Green Inland Waterway Hub with New Automated Container Terminals",
    summary: "Connecting Northeast India with the Bay of Bengal, the inland water transport authority has commissioned two automated cargo berths at Pandu port in Guwahati, slashing transit logistics costs by 28% for tea, organic agricultural produce, and light engineering exports.",
    fullBody: `GUWAHATI \u2014 Assam has taken a major stride in transforming the mighty Brahmaputra river into a high-capacity commercial artery with the inauguration of two fully automated container handling berths at the Pandu port terminal.

The new riverine terminals feature digital customs clearance portals, cold-storage warehousing for Assam Orthodox tea and organic ginger, and zero-emission electric cranes. Vessels with up to 3,000 deadweight tonnage can now dock year-round due to synchronized dredging of National Waterway-2.

State trade representatives noted that waterborne transit via the Indo-Bangladesh Protocol Route reduces transit times to Chittagong and Kolkata by four days compared to congested highway bottlenecks along the Siliguri corridor, while cutting diesel emissions by forty percent.

"This infrastructure modernizes the economic backbone of Assam and the entire Northeast," state port officials confirmed during the maiden sailing of the MV Brahmaputra Star carrying 1,800 tonnes of certified organic agricultural shipments to international export hubs.`,
    category: "Assam News",
    tags: ["Assam Waterways", "Brahmaputra Port", "Guwahati", "Northeast Logistics", "Tea Exports"],
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Container freight vessels navigating the expansive Brahmaputra waterway near Guwahati.",
    imageCredit: "Inland Waterways Authority / Government Archive",
    sourceName: "Assam & Northeast Sentinel",
    sourceUrl: "https://assam.gov.in/transport",
    author: "Ground Zero Northeast Bureau",
    isAiGenerated: true,
    verificationStatus: "confirmed",
    status: "published",
    isBreaking: false,
    isFeatured: true,
    isTrending: false,
    viewCount: 11400,
    readingTimeMinutes: 3,
    publishedAt: new Date(Date.now() - 1e3 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1e3 * 60 * 180).toISOString(),
    commentsCount: 6,
    translations: {
      en: {
        language: "en",
        headline: "Assam Expands Brahmaputra Green Inland Waterway Hub with New Automated Container Terminals",
        summary: "Inland water transport authority commissions automated cargo berths at Pandu port in Guwahati, slashing logistics costs by 28% for Assam tea and exports.",
        seoTitle: "Assam Brahmaputra Waterway: Automated Pandu Port Berth Commissioned",
        seoDescription: "New automated container berths at Guwahati Pandu port cut logistics costs by 28% for Assam exports.",
        keywords: ["Assam news", "Brahmaputra waterway", "Guwahati port"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      as: {
        language: "as",
        headline: "\u09AC\u09CD\u09F0\u09B9\u09CD\u09AE\u09AA\u09C1\u09A4\u09CD\u09F0\u09F0 \u09AC\u09C1\u0995\u09C1\u09A4 \u09A8\u09A4\u09C1\u09A8 \u09AF\u09C1\u0997: \u0997\u09C1\u09F1\u09BE\u09B9\u09BE\u099F\u09C0\u09F0 \u09AA\u09BE\u09A3\u09CD\u09A1\u09C1 \u09AC\u09A8\u09CD\u09A6\u09F0\u09A4 \u09B8\u09CD\u09AC\u09AF\u09BC\u0982\u0995\u09CD\u09F0\u09BF\u09AF\u09BC \u0995\u09A8\u09CD\u099F\u09C7\u0987\u09A8\u09BE\u09F0 \u099F\u09BE\u09F0\u09CD\u09AE\u09BF\u09A8\u09C7\u09B2 \u09AE\u09C1\u0995\u09B2\u09BF, \u09F0\u09AA\u09CD\u09A4\u09BE\u09A8\u09BF \u09AC\u09CD\u09AF\u09AF\u09BC \u09E8\u09EE% \u09B9\u09CD\u09F0\u09BE\u09B8",
        summary: "\u0985\u09B8\u09AE\u09F0 \u099A\u09BE\u09B9 \u0986\u09F0\u09C1 \u0995\u09C3\u09B7\u09BF\u099C\u09BE\u09A4 \u09B8\u09BE\u09AE\u0997\u09CD\u09F0\u09C0 \u09AC\u09BF\u09B6\u09CD\u09AC \u09AC\u099C\u09BE\u09F0\u09B2\u09C8 \u09B8\u09B9\u099C\u09C7 \u09AA\u09CD\u09F0\u09C7\u09F0\u09A3 \u0995\u09F0\u09BE\u09F0 \u09AC\u09BE\u09AC\u09C7 \u0997\u09C1\u09F1\u09BE\u09B9\u09BE\u099F\u09C0\u09F0 \u09AA\u09BE\u09A3\u09CD\u09A1\u09C1 \u09AC\u09A8\u09CD\u09A6\u09F0\u09A4 \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u09A6\u09C1\u099F\u09BE \u0995\u09A8\u09CD\u099F\u09C7\u0987\u09A8\u09BE\u09F0 \u099F\u09BE\u09F0\u09CD\u09AE\u09BF\u09A8\u09C7\u09B2 \u0995\u09BE\u09F0\u09CD\u09AF\u0995\u09CD\u09B7\u09AE \u0995\u09F0\u09BE \u09B9\u09C8\u099B\u09C7\u0964",
        seoTitle: "\u0985\u09B8\u09AE \u09AC\u09CD\u09F0\u09B9\u09CD\u09AE\u09AA\u09C1\u09A4\u09CD\u09F0 \u099C\u09B2\u09AA\u09A5: \u09AA\u09BE\u09A3\u09CD\u09A1\u09C1 \u09AC\u09A8\u09CD\u09A6\u09F0\u09A4 \u09A8\u09A4\u09C1\u09A8 \u099F\u09BE\u09F0\u09CD\u09AE\u09BF\u09A8\u09C7\u09B2",
        seoDescription: "\u0997\u09C1\u09F1\u09BE\u09B9\u09BE\u099F\u09C0\u09F0 \u09AA\u09BE\u09A3\u09CD\u09A1\u09C1 \u09AC\u09A8\u09CD\u09A6\u09F0\u09A4 \u0985\u09A4\u09CD\u09AF\u09BE\u09A7\u09C1\u09A8\u09BF\u0995 \u099F\u09BE\u09F0\u09CD\u09AE\u09BF\u09A8\u09C7\u09B2 \u09AE\u09C1\u0995\u09B2\u09BF\u0964",
        keywords: ["\u0985\u09B8\u09AE \u09AC\u09BE\u09A4\u09F0\u09BF", "\u09AC\u09CD\u09F0\u09B9\u09CD\u09AE\u09AA\u09C1\u09A4\u09CD\u09F0 \u09AC\u09A8\u09CD\u09A6\u09F0", "\u09AA\u09BE\u09A3\u09CD\u09A1\u09C1 \u0997\u09C1\u09F1\u09BE\u09B9\u09BE\u099F\u09C0"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      bn: {
        language: "bn",
        headline: "\u0986\u09B8\u09BE\u09AE\u09C7\u09B0 \u09AC\u09CD\u09B0\u09B9\u09CD\u09AE\u09AA\u09C1\u09A4\u09CD\u09B0\u09C7 \u09A8\u09A4\u09C1\u09A8 \u0987\u09A4\u09BF\u09B9\u09BE\u09B8: \u0997\u09C1\u09AF\u09BC\u09BE\u09B9\u09BE\u099F\u09BF\u09B0 \u09AA\u09BE\u09A3\u09CD\u09A1\u09C1 \u09AC\u09A8\u09CD\u09A6\u09B0\u09C7 \u0985\u09A4\u09CD\u09AF\u09BE\u09A7\u09C1\u09A8\u09BF\u0995 \u0995\u09A8\u09CD\u099F\u09C7\u0987\u09A8\u09BE\u09B0 \u099F\u09BE\u09B0\u09CD\u09AE\u09BF\u09A8\u09BE\u09B2 \u099A\u09BE\u09B2\u09C1",
        summary: "\u0986\u09B8\u09BE\u09AE\u09C7\u09B0 \u099A\u09BE \u098F\u09AC\u0982 \u0995\u09C3\u09B7\u09BF\u09AA\u09A3\u09CD\u09AF \u09B8\u09B9\u099C\u09C7 \u09AC\u09B9\u09BF\u09B0\u09CD\u09AC\u09BF\u09B6\u09CD\u09AC\u09C7 \u09B0\u09AA\u09CD\u09A4\u09BE\u09A8\u09BF\u09B0 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF\u09C7 \u0997\u09C1\u09AF\u09BC\u09BE\u09B9\u09BE\u099F\u09BF\u09B0 \u09AA\u09BE\u09A3\u09CD\u09A1\u09C1 \u09AC\u09A8\u09CD\u09A6\u09B0\u09C7 \u0986\u09A7\u09C1\u09A8\u09BF\u0995 \u09A6\u09C1\u099F\u09BF \u09B8\u09CD\u09AC\u09AF\u09BC\u0982\u0995\u09CD\u09B0\u09BF\u09AF\u09BC \u09AC\u09BE\u09B0\u09CD\u09A5 \u0989\u09A8\u09CD\u09AE\u09CB\u099A\u09A8 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964",
        seoTitle: "\u0986\u09B8\u09BE\u09AE \u09AC\u09CD\u09B0\u09B9\u09CD\u09AE\u09AA\u09C1\u09A4\u09CD\u09B0 \u099C\u09B2\u09AA\u09A5: \u09AA\u09BE\u09A3\u09CD\u09A1\u09C1 \u09AC\u09A8\u09CD\u09A6\u09B0 \u099F\u09BE\u09B0\u09CD\u09AE\u09BF\u09A8\u09BE\u09B2 \u0989\u09A6\u09CD\u09AC\u09CB\u09A7\u09A8",
        seoDescription: "\u0986\u09B8\u09BE\u09AE\u09C7 \u099C\u09B2\u09AA\u09A5 \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09A6\u09BF\u0997\u09A8\u09CD\u09A4 \u0989\u09A8\u09CD\u09AE\u09CB\u099A\u09BF\u09A4\u0964",
        keywords: ["\u0986\u09B8\u09BE\u09AE \u0996\u09AC\u09B0", "\u09AC\u09CD\u09B0\u09B9\u09CD\u09AE\u09AA\u09C1\u09A4\u09CD\u09B0 \u09A8\u09CC\u09AA\u09A5", "\u0997\u09C1\u09AF\u09BC\u09BE\u09B9\u09BE\u099F\u09BF \u09AC\u09A8\u09CD\u09A6\u09B0"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      hi: {
        language: "hi",
        headline: "\u0905\u0938\u092E: \u092C\u094D\u0930\u0939\u094D\u092E\u092A\u0941\u0924\u094D\u0930 \u091C\u0932\u092E\u093E\u0930\u094D\u0917 \u092A\u0930 \u0917\u0941\u0935\u093E\u0939\u093E\u091F\u0940 \u0915\u0947 \u092A\u093E\u0902\u0921\u0941 \u092A\u094B\u0930\u094D\u091F \u092A\u0930 \u0928\u090F \u0938\u094D\u0935\u091A\u093E\u0932\u093F\u0924 \u0915\u0902\u091F\u0947\u0928\u0930 \u091F\u0930\u094D\u092E\u093F\u0928\u0932 \u0936\u0941\u0930\u0942",
        summary: "\u092A\u0942\u0930\u094D\u0935\u094B\u0924\u094D\u0924\u0930 \u092D\u093E\u0930\u0924 \u0915\u0947 \u0935\u094D\u092F\u093E\u092A\u093E\u0930 \u0915\u094B \u0928\u0908 \u0930\u092B\u094D\u0924\u093E\u0930 \u0926\u0947\u0924\u0947 \u0939\u0941\u090F \u0917\u0941\u0935\u093E\u0939\u093E\u091F\u0940 \u0915\u0947 \u092A\u093E\u0902\u0921\u0941 \u092A\u094B\u0930\u094D\u091F \u092A\u0930 \u0905\u0924\u094D\u092F\u093E\u0927\u0941\u0928\u093F\u0915 \u0915\u0902\u091F\u0947\u0928\u0930 \u091F\u0930\u094D\u092E\u093F\u0928\u0932 \u091A\u093E\u0932\u0942 \u0915\u093F\u090F \u0917\u090F \u0939\u0948\u0902, \u091C\u093F\u0938\u0938\u0947 \u0905\u0938\u092E \u0915\u0940 \u091A\u093E\u092F \u0914\u0930 \u0915\u0943\u0937\u093F \u0909\u092A\u091C \u0915\u0947 \u0928\u093F\u0930\u094D\u092F\u093E\u0924 \u0916\u0930\u094D\u091A \u092E\u0947\u0902 28% \u0915\u0940 \u0915\u092E\u0940 \u0906\u090F\u0917\u0940\u0964",
        seoTitle: "\u0905\u0938\u092E \u092C\u094D\u0930\u0939\u094D\u092E\u092A\u0941\u0924\u094D\u0930 \u091C\u0932\u092E\u093E\u0930\u094D\u0917: \u092A\u093E\u0902\u0921\u0941 \u092C\u0902\u0926\u0930\u0917\u093E\u0939 \u092A\u0930 \u0928\u090F \u0915\u0902\u091F\u0947\u0928\u0930 \u091F\u0930\u094D\u092E\u093F\u0928\u0932",
        seoDescription: "\u0917\u0941\u0935\u093E\u0939\u093E\u091F\u0940 \u0915\u0947 \u092A\u093E\u0902\u0921\u0941 \u092A\u094B\u0930\u094D\u091F \u092A\u0930 \u0928\u090F \u0915\u0902\u091F\u0947\u0928\u0930 \u091F\u0930\u094D\u092E\u093F\u0928\u0932 \u0938\u0947 \u092A\u0942\u0930\u094D\u0935\u094B\u0924\u094D\u0924\u0930 \u0915\u0940 \u0932\u0949\u091C\u093F\u0938\u094D\u091F\u093F\u0915\u094D\u0938 \u0932\u093E\u0917\u0924 \u0918\u091F\u0940\u0964",
        keywords: ["\u0905\u0938\u092E \u0938\u092E\u093E\u091A\u093E\u0930", "\u092C\u094D\u0930\u0939\u094D\u092E\u092A\u0941\u0924\u094D\u0930 \u091C\u0932\u092E\u093E\u0930\u094D\u0917", "\u0917\u0941\u0935\u093E\u0939\u093E\u091F\u0940 \u092A\u094B\u0930\u094D\u091F"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  },
  {
    id: "gzn-lead-005",
    originalLanguage: "en",
    currentLanguage: "en",
    headline: "Supreme Court Constitutional Bench Mandates Algorithmic Transparency in Public Sector Decisions",
    summary: "A unanimous five-judge bench has ruled that automated algorithmic risk assessment tools deployed by municipal and judicial authorities must provide human-interpretable rationales and audit trails to uphold fundamental constitutional due process.",
    fullBody: `NEW DELHI \u2014 In a landmark jurisprudence ruling with far-reaching consequences for the digital age, a five-judge Constitutional Bench of the Supreme Court has held that citizens possess an inviolable right to algorithmic transparency whenever administrative decisions impact life, livelihood, or civil liberties.

The judgment invalidates arbitrary automated scoring mechanisms utilized without published validation metrics or verifiable bias mitigation audits.

Chief Justice presiding noted in the unanimous opinion: "A decision that deprives a citizen of entitlements, licences, or bail cannot take refuge behind the opaque curtain of proprietary trade secrets. Where algorithms assist the state, the state must disclose the weightings and training parameters governing that discretion."

Government departments have been given six months to publish certified algorithmic impact assessments for all public-facing automated scoring and resource-allocation software.`,
    category: "India News",
    tags: ["Supreme Court", "Constitutional Law", "AI Ethics", "Due Process", "New Delhi"],
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Supreme Court of India pillars representing constitutional safeguards in algorithmic governance.",
    imageCredit: "Judicial Press Bureau / New Delhi",
    sourceName: "Press Trust of India / National Desk",
    sourceUrl: "https://main.sci.gov.in",
    author: "Ground Zero Legal Affairs Desk",
    isAiGenerated: true,
    verificationStatus: "confirmed",
    status: "published",
    isBreaking: true,
    isFeatured: false,
    isTrending: true,
    viewCount: 22100,
    readingTimeMinutes: 3,
    publishedAt: new Date(Date.now() - 1e3 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1e3 * 60 * 240).toISOString(),
    commentsCount: 18,
    translations: {
      en: {
        language: "en",
        headline: "Supreme Court Constitutional Bench Mandates Algorithmic Transparency in Public Sector Decisions",
        summary: "Unanimous 5-judge Supreme Court bench rules that automated AI tools deployed by state authorities must provide human-interpretable audit trails.",
        seoTitle: "Supreme Court Mandates Algorithmic Transparency in India",
        seoDescription: "Landmark SC verdict gives citizens right to explainability for government AI decisions.",
        keywords: ["Supreme court AI ruling", "algorithmic transparency India"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      hi: {
        language: "hi",
        headline: "\u0938\u0941\u092A\u094D\u0930\u0940\u092E \u0915\u094B\u0930\u094D\u091F \u0915\u0940 \u0938\u0902\u0935\u093F\u0927\u093E\u0928 \u092A\u0940\u0920 \u0915\u093E \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u092B\u0948\u0938\u0932\u093E: \u0938\u0930\u0915\u093E\u0930\u0940 \u092B\u0948\u0938\u0932\u094B\u0902 \u092E\u0947\u0902 \u092A\u094D\u0930\u092F\u0941\u0915\u094D\u0924 \u090F\u0932\u094D\u0917\u094B\u0930\u093F\u0926\u092E \u0935 AI \u0915\u0940 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u093F\u0924\u093E \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F",
        summary: "\u0938\u0941\u092A\u094D\u0930\u0940\u092E \u0915\u094B\u0930\u094D\u091F \u0915\u0940 5 \u091C\u091C\u094B\u0902 \u0915\u0940 \u0938\u0902\u0935\u093F\u0927\u093E\u0928 \u092A\u0940\u0920 \u0928\u0947 \u0938\u0930\u094D\u0935\u0938\u092E\u094D\u092E\u0924\u093F \u0938\u0947 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u0926\u0940 \u0939\u0948 \u0915\u093F \u0938\u0930\u0915\u093E\u0930\u0940 \u0924\u0902\u0924\u094D\u0930 \u0926\u094D\u0935\u093E\u0930\u093E \u0932\u093F\u090F \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u0947 \u0915\u093F\u0938\u0940 \u092D\u0940 \u092B\u0948\u0938\u0932\u0947 \u092E\u0947\u0902 \u0907\u0938\u094D\u0924\u0947\u092E\u093E\u0932 \u0939\u094B\u0928\u0947 \u0935\u093E\u0932\u0947 \u090F\u0906\u0908 \u0935 \u0915\u0902\u092A\u094D\u092F\u0942\u091F\u0930 \u0938\u093F\u0938\u094D\u091F\u092E \u0915\u0940 \u091C\u093E\u0902\u091A \u0935 \u0938\u094D\u092A\u0937\u094D\u091F\u0940\u0915\u0930\u0923 \u091C\u0928\u0924\u093E \u0915\u093E \u092E\u094C\u0932\u093F\u0915 \u0905\u0927\u093F\u0915\u093E\u0930 \u0939\u0948\u0964",
        seoTitle: "\u0938\u0941\u092A\u094D\u0930\u0940\u092E \u0915\u094B\u0930\u094D\u091F \u0915\u093E \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u092B\u0948\u0938\u0932\u093E: \u0938\u0930\u0915\u093E\u0930\u0940 \u090F\u0906\u0908 \u092E\u0947\u0902 \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u093F\u0924\u093E \u091C\u0930\u0942\u0930\u0940",
        seoDescription: "\u0938\u0941\u092A\u094D\u0930\u0940\u092E \u0915\u094B\u0930\u094D\u091F \u0928\u0947 \u0915\u0939\u093E \u0915\u093F proprietary \u0915\u094B\u0921 \u0915\u0940 \u0906\u0921\u093C \u092E\u0947\u0902 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0905\u0927\u093F\u0915\u093E\u0930 \u0928\u0939\u0940\u0902 \u091B\u0940\u0928\u0947 \u091C\u093E \u0938\u0915\u0924\u0947\u0964",
        keywords: ["\u0938\u0941\u092A\u094D\u0930\u0940\u092E \u0915\u094B\u0930\u094D\u091F", "\u090F\u0932\u094D\u0917\u094B\u0930\u093F\u0926\u092E \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u093F\u0924\u093E", "\u0938\u0902\u0935\u093F\u0927\u093E\u0928 \u092A\u0940\u0920 \u092B\u0948\u0938\u0932\u093E"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  },
  {
    id: "gzn-lead-006",
    originalLanguage: "en",
    currentLanguage: "en",
    headline: "Space Telescope Detects Atmospheric Ozone and Methane Equilibrium on Super-Earth K2-18b",
    summary: "Astrobiologists analyzing infrared transmission spectra have confirmed co-existing disequilibrium signatures of ozone and biogenic methane in the temperate troposphere of an exoplanet 124 light-years away.",
    fullBody: `BALTIMORE / PARIS \u2014 Spectroscopic confirmation of atmospheric ozone coexisting with methane in the sub-Neptune exoplanet K2-18b has provided humanity with its most intriguing non-equilibrium planetary signature to date.

Data collected across four transit occultations by deep-space infrared observatories reveals an atmospheric mixing ratio consistent with photochemical cycles that, in terrestrial settings, are replenished continually by organic biological processes.

While planetary scientists urge caution\u2014stressing that abiotic photochemical phenomena involving mantle interactions or ultraviolet stellar flares cannot yet be categorically excluded\u2014the finding warrants immediate high-resolution spectroscopic follow-up on upcoming observation cycles.

"We are witnessing the golden epoch of exoplanet characterization," remarked lead astrobiologist Dr. Sarah Lin during an emergency symposium held at the International Astronomical Union. "We are now moving from merely finding planets to reading the atmospheric chemical biographies of other worlds."`,
    category: "Science",
    tags: ["Astrobiology", "Space Telescope", "Exoplanets", "K2-18b", "Cosmology"],
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Artist visualization of exoplanet K2-18b illuminated by its red dwarf host star.",
    imageCredit: "NASA / ESA / Space Telescope Science Institute",
    sourceName: "International Astronomical Pool",
    sourceUrl: "https://www.nasa.gov/mission_pages/webb",
    author: "Ground Zero Astrophysics Bureau",
    isAiGenerated: true,
    verificationStatus: "confirmed",
    status: "published",
    isBreaking: false,
    isFeatured: false,
    isTrending: true,
    viewCount: 19800,
    readingTimeMinutes: 4,
    publishedAt: new Date(Date.now() - 1e3 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1e3 * 60 * 300).toISOString(),
    commentsCount: 31,
    translations: {
      en: {
        language: "en",
        headline: "Space Telescope Detects Atmospheric Ozone and Methane Equilibrium on Super-Earth K2-18b",
        summary: "Spectroscopy reveals intriguing atmospheric disequilibrium of ozone and methane on exoplanet K2-18b 124 light-years distant.",
        seoTitle: "Space Telescope Detects Ozone & Methane on Exoplanet K2-18b",
        seoDescription: "Astronomers detect atmospheric signatures on K2-18b 124 light-years away.",
        keywords: ["K2-18b", "space telescope", "exoplanet ozone"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  },
  {
    id: "gzn-lead-007",
    originalLanguage: "en",
    currentLanguage: "en",
    headline: "Global Chip Consortium Announces 1.4-Nanometer RibbonFET Commercial Foundry Pilot",
    summary: "Semiconductor manufacturers in Hsinchu and Dresden have achieved first-pass silicon yields exceeding 74% on the world's first gate-all-around 1.4nm nodes, delivering 22% computational efficiency gains for on-device edge AI processors.",
    fullBody: `HSINCHU / DRESDEN \u2014 In a quantum leap for microelectronics architecture, the leading international semiconductor alliance has announced pilot commercial wafer output on its 1.4-nanometer (A14) RibbonFET process.

The new node introduces backside power delivery networks (BSPDN) alongside quad-stacked nanosheet gates, allowing transistors to switch at clock frequencies above 6.2 GHz while operating at under 0.65 volts. This architecture significantly curtails heat dissipation in mobile smartphones and server racks alike.

Industry analysts estimate that initial commercial production will power flagship AI accelerators and low-power wearable neural coprocessors beginning late 2027.`,
    category: "Technology",
    tags: ["Semiconductors", "1.4nm Process", "RibbonFET", "Foundry", "Hardware"],
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Silicon wafer with microscopic RibbonFET transistor architectures under cleanroom inspection.",
    imageCredit: "Foundry Consortium / Public Tech Archive",
    sourceName: "Semiconductor Engineering Times",
    sourceUrl: "https://semiengineering.com",
    author: "Ground Zero Hardware Desk",
    isAiGenerated: true,
    verificationStatus: "confirmed",
    status: "published",
    isBreaking: false,
    isFeatured: false,
    isTrending: false,
    viewCount: 8940,
    readingTimeMinutes: 3,
    publishedAt: new Date(Date.now() - 1e3 * 60 * 360).toISOString(),
    updatedAt: new Date(Date.now() - 1e3 * 60 * 360).toISOString(),
    commentsCount: 4,
    translations: {
      en: {
        language: "en",
        headline: "Global Chip Consortium Announces 1.4-Nanometer RibbonFET Commercial Foundry Pilot",
        summary: "Commercial foundry pilot achieves 74% yield on 1.4nm gate-all-around silicon with backside power delivery.",
        seoTitle: "1.4-Nanometer RibbonFET Semiconductor Breakthrough",
        seoDescription: "New 1.4nm process offers 22% efficiency improvements for next-generation edge AI computing.",
        keywords: ["1.4nm chip", "semiconductor foundry", "RibbonFET"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  },
  {
    id: "gzn-lead-008",
    originalLanguage: "en",
    currentLanguage: "en",
    headline: "International Cricket Council Unveils Olympic Qualification Format for 2028 Los Angeles Games",
    summary: "Cricket's historic return to the Olympic Games will feature a rigorous six-team men's and women's Twenty20 tournament, with regional qualifying tournaments spanning Africa, Asia-Pacific, Europe, and the Americas over the next twenty-four months.",
    fullBody: `DUBAI \u2014 The International Cricket Council has finalized the competition structure and regional qualification roadmap for cricket's historic re-entry into the Olympic Games at Los Angeles 2028.

Both men's and women's editions will feature six participating nations competing in a high-intensity single-group round-robin followed by medal playoffs at a state-of-the-art temporary stadium in Pomona, California.

Host nation United States receives automatic qualification slots, while the top three ranked teams on the ICC T20I world standings cutoff date will earn direct entry. The remaining two spots will be decided via fiercely contested inter-continental qualification tournaments in early 2028.`,
    category: "Sports",
    tags: ["Cricket", "Olympics 2028", "ICC", "LA28", "T20"],
    imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Cricket stadium illuminated under floodlights for championship Twenty20 action.",
    imageCredit: "ICC Media / Tournament Media Pool",
    sourceName: "World Sports Desk",
    sourceUrl: "https://www.icc-cricket.com",
    author: "Ground Zero Sports Bureau",
    isAiGenerated: false,
    verificationStatus: "confirmed",
    status: "published",
    isBreaking: false,
    isFeatured: false,
    isTrending: true,
    viewCount: 15300,
    readingTimeMinutes: 3,
    publishedAt: new Date(Date.now() - 1e3 * 60 * 420).toISOString(),
    updatedAt: new Date(Date.now() - 1e3 * 60 * 420).toISOString(),
    commentsCount: 11,
    translations: {
      en: {
        language: "en",
        headline: "International Cricket Council Unveils Olympic Qualification Format for 2028 Los Angeles Games",
        summary: "Rigorous six-team T20 Olympic format announced for cricket re-entry at LA28 with host USA and direct qualifiers.",
        seoTitle: "Cricket at LA 2028 Olympics: ICC Unveils 6-Team Qualification Format",
        seoDescription: "ICC outlines the qualification pathway for cricket's return to the Olympic Games in Los Angeles.",
        keywords: ["cricket olympics 2028", "ICC LA28", "olympic cricket format"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  },
  {
    id: "gzn-lead-009",
    originalLanguage: "en",
    currentLanguage: "en",
    headline: "Exclusive Report: Global Whistleblower Network Exposes Cross-Border Digital Carbon Credit Fraud",
    summary: "A multi-month Ground Zero investigative probe examining 380,000 blockchain-registered forestry offsets reveals phantom carbon claims totaling $420 million across unregulated voluntary carbon brokers in three continents.",
    fullBody: `LONDON / NAIROBI / MUMBAI \u2014 A joint investigation by Ground Zero News Investigative Consortium has uncovered extensive fabricated claims within international voluntary carbon offset exchanges.

Over thirty-five percent of inspected reforestation tracts in sub-Saharan Africa and Southeast Asia registered as "active high-density canopy" were found to be either commercial monoculture timber plantations already slated for harvesting, or arid scrubland that had sustained zero planting activity.

Financial records cross-referenced with satellite synthetic-aperture radar (SAR) telemetry demonstrate that multinational conglomerates purchased millions of metric tonnes in bogus emission write-downs to market consumer products as "100% Carbon Neutral."

International financial regulatory watchdogs have initiated formal inquiry proceedings following our submission of the documentary dossier.`,
    category: "Exclusive Reports",
    tags: ["Investigative Scoop", "Carbon Offsets", "Environmental Fraud", "Whistleblower", "Global Probe"],
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Satellite inspection overlays contrasting claimed reforestation sectors against actual terrain data.",
    imageCredit: "Ground Zero Investigative Bureau / SAR Telemetry",
    sourceName: "Ground Zero Investigative Unit",
    sourceUrl: "https://groundzeronews.org/investigations/carbon-dossier",
    author: "Devraj Barua & GZN Special Projects",
    isAiGenerated: false,
    verificationStatus: "investigative",
    status: "published",
    isBreaking: true,
    isFeatured: true,
    isTrending: true,
    viewCount: 34500,
    readingTimeMinutes: 6,
    publishedAt: new Date(Date.now() - 1e3 * 60 * 500).toISOString(),
    updatedAt: new Date(Date.now() - 1e3 * 60 * 500).toISOString(),
    commentsCount: 48,
    translations: {
      en: {
        language: "en",
        headline: "Exclusive Report: Global Whistleblower Network Exposes Cross-Border Digital Carbon Credit Fraud",
        summary: "Ground Zero investigation reveals $420 million phantom forestry carbon claims across voluntary offsets.",
        seoTitle: "Exclusive: $420M Carbon Credit Fraud Exposed by Ground Zero News",
        seoDescription: "Investigation uncovers fabricated carbon offset schemes marketed as neutral emissions.",
        keywords: ["carbon fraud", "investigative journalism", "ground zero exclusive"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      pa: {
        language: "pa",
        headline: "\u0A35\u0A3F\u0A38\u0A3C\u0A47\u0A38\u0A3C \u0A1C\u0A3E\u0A02\u0A1A \u0A30\u0A3F\u0A2A\u0A4B\u0A30\u0A1F: \u0A17\u0A30\u0A3E\u0A0A\u0A02\u0A21 \u0A1C\u0A3C\u0A40\u0A30\u0A4B \u0A28\u0A3F\u0A0A\u0A1C\u0A3C \u0A35\u0A71\u0A32\u0A4B\u0A02 42 \u0A15\u0A30\u0A4B\u0A5C \u0A21\u0A3E\u0A32\u0A30 \u0A26\u0A47 \u0A2B\u0A30\u0A1C\u0A3C\u0A40 \u0A15\u0A3E\u0A30\u0A2C\u0A28 \u0A15\u0A4D\u0A30\u0A48\u0A21\u0A3F\u0A1F \u0A18\u0A41\u0A1F\u0A3E\u0A32\u0A47 \u0A26\u0A3E \u0A2A\u0A30\u0A26\u0A3E\u0A2B\u0A3E\u0A38\u0A3C",
        summary: "\u0A38\u0A3E\u0A21\u0A40 \u0A35\u0A3F\u0A38\u0A3C\u0A47\u0A38\u0A3C \u0A1C\u0A3E\u0A02\u0A1A \u0A1F\u0A40\u0A2E \u0A28\u0A47 \u0A38\u0A48\u0A1F\u0A47\u0A32\u0A3E\u0A08\u0A1F \u0A21\u0A3E\u0A1F\u0A3E \u0A30\u0A3E\u0A39\u0A40\u0A02 \u0A16\u0A41\u0A32\u0A3E\u0A38\u0A3E \u0A15\u0A40\u0A24\u0A3E \u0A39\u0A48 \u0A15\u0A3F \u0A30\u0A41\u0A71\u0A16 \u0A32\u0A17\u0A3E\u0A09\u0A23 \u0A26\u0A47 \u0A28\u0A3E\u0A2E '\u0A24\u0A47 \u0A2C\u0A39\u0A41-\u0A30\u0A3E\u0A38\u0A3C\u0A1F\u0A30\u0A40 \u0A15\u0A70\u0A2A\u0A28\u0A40\u0A06\u0A02 \u0A35\u0A71\u0A32\u0A4B\u0A02 \u0A05\u0A30\u0A2C\u0A3E\u0A02 \u0A30\u0A41\u0A2A\u0A0F \u0A26\u0A47 \u0A1D\u0A42\u0A20\u0A47 \u0A38\u0A30\u0A1F\u0A40\u0A2B\u0A3F\u0A15\u0A47\u0A1F \u0A35\u0A47\u0A1A\u0A47 \u0A1C\u0A3E \u0A30\u0A39\u0A47 \u0A38\u0A28\u0964",
        seoTitle: "\u0A17\u0A30\u0A3E\u0A0A\u0A02\u0A21 \u0A1C\u0A3C\u0A40\u0A30\u0A4B \u0A35\u0A3F\u0A38\u0A3C\u0A47\u0A38\u0A3C \u0A30\u0A3F\u0A2A\u0A4B\u0A30\u0A1F: \u0A15\u0A3E\u0A30\u0A2C\u0A28 \u0A15\u0A4D\u0A30\u0A48\u0A21\u0A3F\u0A1F \u0A18\u0A41\u0A1F\u0A3E\u0A32\u0A3E",
        seoDescription: "\u0A1C\u0A3E\u0A02\u0A1A \u0A30\u0A3F\u0A2A\u0A4B\u0A30\u0A1F \u0A35\u0A3F\u0A71\u0A1A \u0A2B\u0A30\u0A1C\u0A3C\u0A40 \u0A15\u0A3E\u0A30\u0A2C\u0A28 \u0A06\u0A2B\u0A38\u0A48\u0A71\u0A1F \u0A2F\u0A4B\u0A1C\u0A28\u0A3E\u0A35\u0A3E\u0A02 \u0A26\u0A3E \u0A2A\u0A30\u0A26\u0A3E\u0A2B\u0A3E\u0A38\u0A3C\u0964",
        keywords: ["\u0A35\u0A3F\u0A38\u0A3C\u0A47\u0A38\u0A3C \u0A1C\u0A3E\u0A02\u0A1A", "\u0A15\u0A3E\u0A30\u0A2C\u0A28 \u0A18\u0A41\u0A1F\u0A3E\u0A32\u0A3E", "\u0A17\u0A30\u0A3E\u0A0A\u0A02\u0A21 \u0A1C\u0A3C\u0A40\u0A30\u0A4B \u0A28\u0A3F\u0A0A\u0A1C\u0A3C"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      hi: {
        language: "hi",
        headline: "\u090F\u0915\u094D\u0938\u0915\u094D\u0932\u0942\u0938\u093F\u0935 \u0930\u093F\u092A\u094B\u0930\u094D\u091F: \u0917\u094D\u0930\u093E\u0909\u0902\u0921 \u091C\u0940\u0930\u094B \u0928\u094D\u092F\u0942\u091C \u0928\u0947 \u0915\u093F\u092F\u093E 420 \u092E\u093F\u0932\u093F\u092F\u0928 \u0921\u0949\u0932\u0930 \u0915\u0947 \u092B\u0930\u094D\u091C\u0940 \u0915\u093E\u0930\u094D\u092C\u0928 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0918\u094B\u091F\u093E\u0932\u0947 \u0915\u093E \u0916\u0941\u0932\u093E\u0938\u093E",
        summary: "\u0917\u094D\u0930\u093E\u0909\u0902\u0921 \u091C\u0940\u0930\u094B \u0928\u094D\u092F\u0942\u091C \u0915\u0940 \u0916\u094B\u091C\u0940 \u091F\u0940\u092E \u0928\u0947 \u0938\u0948\u091F\u0947\u0932\u093E\u0907\u091F \u0921\u0947\u091F\u093E \u0914\u0930 \u0935\u094D\u0939\u093F\u0938\u0932\u092C\u094D\u0932\u094B\u0905\u0930 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u094B\u0902 \u0915\u0947 \u091C\u0930\u093F\u090F \u0905\u0902\u0924\u0930\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F \u0938\u094D\u0935\u0948\u091A\u094D\u091B\u093F\u0915 \u0915\u093E\u0930\u094D\u092C\u0928 \u092C\u093E\u091C\u093E\u0930 \u092E\u0947\u0902 \u091A\u0932 \u0930\u0939\u0947 \u092C\u0921\u093C\u0947 \u0916\u0947\u0932 \u0915\u094B \u092C\u0947\u0928\u0915\u093E\u092C \u0915\u093F\u092F\u093E \u0939\u0948\u0964",
        seoTitle: "\u0917\u094D\u0930\u093E\u0909\u0902\u0921 \u091C\u0940\u0930\u094B \u090F\u0915\u094D\u0938\u0915\u094D\u0932\u0942\u0938\u093F\u0935: 420 \u092E\u093F\u0932\u093F\u092F\u0928 \u0921\u0949\u0932\u0930 \u0915\u093E \u0915\u093E\u0930\u094D\u092C\u0928 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0918\u094B\u091F\u093E\u0932\u093E",
        seoDescription: "\u0916\u094B\u091C\u0940 \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u092E\u0947\u0902 \u0916\u0941\u0932\u093E\u0938\u093E: \u0915\u093E\u0917\u091C\u094B\u0902 \u092A\u0930 \u0926\u093F\u0916\u093E\u090F \u0917\u090F \u091C\u0902\u0917\u0932, \u092C\u0947\u091A\u0947 \u0917\u090F \u092B\u0930\u094D\u091C\u0940 \u0915\u093E\u0930\u094D\u092C\u0928 \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u0964",
        keywords: ["\u0916\u094B\u091C\u0940 \u092A\u0924\u094D\u0930\u0915\u093E\u0930\u093F\u0924\u093E", "\u0915\u093E\u0930\u094D\u092C\u0928 \u0918\u094B\u091F\u093E\u0932\u093E", "\u0917\u094D\u0930\u093E\u0909\u0902\u0921 \u091C\u0940\u0930\u094B \u090F\u0915\u094D\u0938\u0915\u094D\u0932\u0942\u0938\u093F\u0935"],
        translatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }
  }
];

// server/db.ts
var DB_DIR = path.resolve("data");
var DB_FILE = path.join(DB_DIR, "groundzero_db.json");
var dbCache = null;
function loadDatabase() {
  if (dbCache) return dbCache;
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      dbCache = JSON.parse(content);
      return dbCache;
    } catch (err) {
      console.error("[DB] Failed reading db file, re-seeding:", err);
    }
  }
  dbCache = {
    articles: INITIAL_ARTICLES,
    feeds: INITIAL_FEEDS,
    ads: INITIAL_ADS,
    settings: INITIAL_SETTINGS,
    users: INITIAL_ADMIN_USERS,
    logs: [
      {
        id: "log-init-1",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        taskType: "rss_ingest",
        status: "success",
        source: "Automated Seed Registry",
        details: "System initialized with 9 verified multi-lingual investigative reports and 6 live RSS wire feeds.",
        articlesProcessed: INITIAL_ARTICLES.length,
        durationMs: 820
      }
    ],
    comments: [
      {
        id: "comm-1",
        articleId: "gzn-lead-001",
        userName: "Major Jaswinder Brar (Retd.)",
        content: "Groundbreaking analysis on the transmission infrastructure. Without UHVDC links, renewable power is routinely curtailed.",
        createdAt: new Date(Date.now() - 1e3 * 60 * 30).toISOString(),
        status: "approved",
        likes: 12
      },
      {
        id: "comm-2",
        articleId: "gzn-lead-009",
        userName: "Dr. Katherine Vance",
        content: "Commendable investigative reporting. The voluntary carbon offset market has needed forensic scrutiny of this depth for years.",
        createdAt: new Date(Date.now() - 1e3 * 60 * 95).toISOString(),
        status: "approved",
        likes: 24
      }
    ]
  };
  saveDatabase(dbCache);
  return dbCache;
}
function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    dbCache = data;
  } catch (err) {
    console.error("[DB] Failed writing to db file:", err);
  }
}
var db = {
  getArticles(params) {
    const data = loadDatabase();
    let list = [...data.articles];
    if (params?.status) {
      list = list.filter((a) => a.status === params.status);
    } else {
      list = list.filter((a) => a.status === "published");
    }
    if (params?.category && params.category !== "All" && params.category !== "all") {
      list = list.filter((a) => a.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params?.breaking !== void 0) {
      list = list.filter((a) => a.isBreaking === params.breaking);
    }
    if (params?.trending !== void 0) {
      list = list.filter((a) => a.isTrending === params.trending);
    }
    if (params?.featured !== void 0) {
      list = list.filter((a) => a.isFeatured === params.featured);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) => a.headline.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    const lang = params?.language || "en";
    const localized = list.map((a) => {
      if (lang === "en" || !a.translations[lang]) {
        return { ...a, currentLanguage: lang };
      }
      const t = a.translations[lang];
      return {
        ...a,
        currentLanguage: lang,
        headline: t.headline || a.headline,
        summary: t.summary || a.summary,
        fullBody: t.fullBody || a.fullBody
      };
    });
    const offset = params?.offset || 0;
    const limit = params?.limit || 50;
    return {
      total: localized.length,
      articles: localized.slice(offset, offset + limit)
    };
  },
  getAllAdminArticles() {
    const data = loadDatabase();
    return [...data.articles].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  },
  getArticleById(id, language) {
    const data = loadDatabase();
    const found = data.articles.find((a) => a.id === id);
    if (!found) return null;
    found.viewCount = (found.viewCount || 0) + 1;
    saveDatabase(data);
    const lang = language || "en";
    if (lang !== "en" && found.translations[lang]) {
      const t = found.translations[lang];
      return {
        ...found,
        currentLanguage: lang,
        headline: t.headline || found.headline,
        summary: t.summary || found.summary,
        fullBody: t.fullBody || found.fullBody
      };
    }
    return { ...found, currentLanguage: lang };
  },
  createArticle(article) {
    const data = loadDatabase();
    data.articles.unshift(article);
    saveDatabase(data);
    return article;
  },
  updateArticle(id, updates) {
    const data = loadDatabase();
    const idx = data.articles.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    data.articles[idx] = {
      ...data.articles[idx],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveDatabase(data);
    return data.articles[idx];
  },
  deleteArticle(id) {
    const data = loadDatabase();
    const prevLen = data.articles.length;
    data.articles = data.articles.filter((a) => a.id !== id);
    if (data.articles.length !== prevLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },
  saveTranslation(articleId, translation) {
    const data = loadDatabase();
    const article = data.articles.find((a) => a.id === articleId);
    if (!article) return false;
    article.translations = article.translations || {};
    article.translations[translation.language] = translation;
    article.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    saveDatabase(data);
    return true;
  },
  // FEEDS
  getFeeds() {
    const data = loadDatabase();
    return data.feeds;
  },
  addFeed(feed) {
    const data = loadDatabase();
    data.feeds.push(feed);
    saveDatabase(data);
    return feed;
  },
  updateFeed(id, updates) {
    const data = loadDatabase();
    const idx = data.feeds.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    data.feeds[idx] = { ...data.feeds[idx], ...updates };
    saveDatabase(data);
    return data.feeds[idx];
  },
  deleteFeed(id) {
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
  getSettings() {
    const data = loadDatabase();
    return data.settings;
  },
  updateSettings(updates) {
    const data = loadDatabase();
    data.settings = { ...data.settings, ...updates };
    saveDatabase(data);
    return data.settings;
  },
  // ADS
  getAds() {
    const data = loadDatabase();
    return data.ads;
  },
  saveAd(ad) {
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
  deleteAd(id) {
    const data = loadDatabase();
    const count = data.ads.length;
    data.ads = data.ads.filter((a) => a.id !== id);
    if (data.ads.length !== count) {
      saveDatabase(data);
      return true;
    }
    return false;
  },
  incrementAdMetric(id, type) {
    const data = loadDatabase();
    const ad = data.ads.find((a) => a.id === id);
    if (ad) {
      if (type === "impression") ad.impressions = (ad.impressions || 0) + 1;
      if (type === "click") ad.clicks = (ad.clicks || 0) + 1;
      saveDatabase(data);
    }
  },
  // COMMENTS
  getComments(articleId) {
    const data = loadDatabase();
    return data.comments.filter((c) => c.articleId === articleId && c.status === "approved").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addComment(comment) {
    const data = loadDatabase();
    data.comments.unshift(comment);
    saveDatabase(data);
    return comment;
  },
  // LOGS
  getAiLogs() {
    const data = loadDatabase();
    return data.logs.slice(0, 100);
  },
  addAiLog(log) {
    const data = loadDatabase();
    data.logs.unshift(log);
    if (data.logs.length > 200) data.logs.pop();
    saveDatabase(data);
  },
  // STATS
  getStats() {
    const data = loadDatabase();
    const totalArticles = data.articles.length;
    const publishedArticles = data.articles.filter((a) => a.status === "published").length;
    const pendingApproval = data.articles.filter((a) => a.status === "pending_approval").length;
    const totalViews = data.articles.reduce((acc, a) => acc + (a.viewCount || 0), 0);
    const categoryDistribution = {};
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
      lastAutoRunAt: data.settings.lastAutoRunAt
    };
  }
};

// server/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";

// src/constants/languages.ts
var SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", isRTL: false, enabled: true },
  { code: "pa", name: "Punjabi", nativeName: "\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40", isRTL: false, enabled: true },
  { code: "hi", name: "Hindi", nativeName: "\u0939\u093F\u0928\u094D\u0926\u0940", isRTL: false, enabled: true },
  { code: "as", name: "Assamese", nativeName: "\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE", isRTL: false, enabled: true },
  { code: "bn", name: "Bengali", nativeName: "\u09AC\u09BE\u0982\u09B2\u09BE", isRTL: false, enabled: true },
  { code: "ta", name: "Tamil", nativeName: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD", isRTL: false, enabled: true },
  { code: "te", name: "Telugu", nativeName: "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41", isRTL: false, enabled: true },
  { code: "ml", name: "Malayalam", nativeName: "\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02", isRTL: false, enabled: true },
  { code: "kn", name: "Kannada", nativeName: "\u0C95\u0CA8\u0CCD\u0CA8\u0CA1", isRTL: false, enabled: true },
  { code: "mr", name: "Marathi", nativeName: "\u092E\u0930\u093E\u0920\u0940", isRTL: false, enabled: true },
  { code: "gu", name: "Gujarati", nativeName: "\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0", isRTL: false, enabled: true },
  { code: "ur", name: "Urdu", nativeName: "\u0627\u0631\u062F\u0648", isRTL: true, enabled: true },
  { code: "ar", name: "Arabic", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", isRTL: true, enabled: true },
  { code: "fr", name: "French", nativeName: "Fran\xE7ais", isRTL: false, enabled: true },
  { code: "es", name: "Spanish", nativeName: "Espa\xF1ol", isRTL: false, enabled: true },
  { code: "de", name: "German", nativeName: "Deutsch", isRTL: false, enabled: true },
  { code: "ru", name: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", isRTL: false, enabled: true },
  { code: "zh", name: "Chinese", nativeName: "\u4E2D\u6587 (\u7B80\u4F53)", isRTL: false, enabled: true },
  { code: "ja", name: "Japanese", nativeName: "\u65E5\u672C\u8A9E", isRTL: false, enabled: true }
];
var LANGUAGE_MAP = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lang) => [lang.code, lang])
);

// server/geminiService.ts
var apiKey = process.env.GEMINI_API_KEY;
var ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
async function processNewsItemsWithAi(items, existingHeadlines) {
  if (!ai) {
    console.warn("[GeminiService] GEMINI_API_KEY is not configured. Falling back to heuristic processing.");
    return items.map((item) => ({
      headline: item.title.replace(/ - [^-]+$/, "").trim(),
      summary: item.description.replace(/<[^>]*>?/gm, "").slice(0, 320) + "...",
      fullBody: item.description.replace(/<[^>]*>?/gm, ""),
      category: item.category || "World News",
      tags: ["Verified Feed", "Ground Zero Ingest"],
      verificationStatus: "confirmed",
      isDuplicate: false,
      seoTitle: item.title,
      seoDescription: item.description.replace(/<[^>]*>?/gm, "").slice(0, 155),
      keywords: ["news", "breaking news", "world"],
      initialTranslations: {}
    }));
  }
  try {
    const prompt = `You are the Chief AI News Architect for GROUND ZERO NEWS ("Truth First. News Everywhere.").
Analyze these freshly fetched raw news reports. Follow strict editorial guidelines:
1. NEVER generate fake news or hallucinate facts, dates, names, or statistics.
2. Filter out duplicates based on these existing headlines:
${JSON.stringify(existingHeadlines.slice(0, 15))}
3. For each unique valid news report, create:
   - A factual, authoritative headline (original wording, no clickbait).
   - A concise, objective 2-3 paragraph summary preserving all verifiable facts.
   - An expanded factual article body synthesized strictly from the source facts.
   - Assign the most appropriate category from:
     ['Breaking News', 'India News', 'World News', 'Punjab News', 'Assam News', 'Politics', 'Business', 'Economy', 'Technology', 'Artificial Intelligence', 'Science', 'Sports', 'Entertainment', 'Education', 'Health', 'Crime', 'Defence', 'Agriculture', 'Weather', 'Lifestyle', 'Viral News', 'Opinion', 'Exclusive Reports'].
   - Assign verificationStatus: 'confirmed' or 'developing'.
   - Generate SEO title, meta description (<160 chars), and 5 keywords.
   - Provide accurate translations in Punjabi ('pa'), Hindi ('hi'), and Urdu ('ur').

Raw Items:
${JSON.stringify(
      items.slice(0, 5).map((it) => ({
        title: it.title,
        snippet: it.description.slice(0, 400),
        source: it.source
      }))
    )}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior digital news editor for an international multi-lingual wire service. Output pristine factual journalism and valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              fullBody: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              verificationStatus: { type: Type.STRING },
              isDuplicate: { type: Type.BOOLEAN },
              seoTitle: { type: Type.STRING },
              seoDescription: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              initialTranslations: {
                type: Type.OBJECT,
                properties: {
                  pa: {
                    type: Type.OBJECT,
                    properties: {
                      headline: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      seoTitle: { type: Type.STRING },
                      seoDescription: { type: Type.STRING }
                    },
                    required: ["headline", "summary"]
                  },
                  hi: {
                    type: Type.OBJECT,
                    properties: {
                      headline: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      seoTitle: { type: Type.STRING },
                      seoDescription: { type: Type.STRING }
                    },
                    required: ["headline", "summary"]
                  },
                  ur: {
                    type: Type.OBJECT,
                    properties: {
                      headline: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      seoTitle: { type: Type.STRING },
                      seoDescription: { type: Type.STRING }
                    },
                    required: ["headline", "summary"]
                  }
                }
              }
            },
            required: [
              "headline",
              "summary",
              "fullBody",
              "category",
              "verificationStatus",
              "isDuplicate",
              "seoTitle",
              "seoDescription"
            ]
          }
        }
      }
    });
    const jsonText = response.text || "[]";
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error("[GeminiService] Error processing news batch:", error);
    return items.map((item) => ({
      headline: item.title.replace(/ - [^-]+$/, "").trim(),
      summary: item.description.replace(/<[^>]*>?/gm, "").slice(0, 320) + "...",
      fullBody: item.description.replace(/<[^>]*>?/gm, ""),
      category: item.category || "World News",
      tags: ["Verified Feed", "Ground Zero News"],
      verificationStatus: "confirmed",
      isDuplicate: false,
      seoTitle: item.title,
      seoDescription: item.description.replace(/<[^>]*>?/gm, "").slice(0, 155),
      keywords: ["news", "breaking"],
      initialTranslations: {}
    }));
  }
}
async function translateArticleWithAi(headline, summary, fullBody, targetLanguage) {
  const langInfo = LANGUAGE_MAP[targetLanguage] || { name: targetLanguage, nativeName: targetLanguage };
  if (!ai) {
    return {
      headline: `[${langInfo.nativeName}] ${headline}`,
      summary: `[${langInfo.nativeName} translation preview] ${summary}`,
      fullBody: `[${langInfo.nativeName} translation preview]

${fullBody}`,
      seoTitle: `${headline} - Ground Zero News (${langInfo.name})`,
      seoDescription: summary.slice(0, 150),
      keywords: ["news", langInfo.name.toLowerCase()]
    };
  }
  const prompt = `Translate this news article faithfully and professionally into ${langInfo.name} (${langInfo.nativeName}).
Preserve all factual accuracy, proper nouns, dates, quotations, and journalistic gravitas. Use proper native script and natural journalistic idioms.

Original English Headline:
${headline}

Original English Summary:
${summary}

Original English Body:
${fullBody.slice(0, 1500)}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an expert bilingual journalist translating wire reports into ${langInfo.name}. Return valid JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            summary: { type: Type.STRING },
            fullBody: { type: Type.STRING },
            seoTitle: { type: Type.STRING },
            seoDescription: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["headline", "summary", "fullBody", "seoTitle", "seoDescription"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return {
      headline: parsed.headline || headline,
      summary: parsed.summary || summary,
      fullBody: parsed.fullBody || fullBody,
      seoTitle: parsed.seoTitle || `${headline} | Ground Zero News`,
      seoDescription: parsed.seoDescription || summary.slice(0, 150),
      keywords: parsed.keywords || ["news"]
    };
  } catch (error) {
    console.error(`[GeminiService] Translation error for ${targetLanguage}:`, error);
    return {
      headline: `[${langInfo.nativeName}] ${headline}`,
      summary: `[${langInfo.nativeName}] ${summary}`,
      fullBody: `[${langInfo.nativeName}]

${fullBody}`,
      seoTitle: `${headline} - Ground Zero News (${langInfo.name})`,
      seoDescription: summary.slice(0, 150),
      keywords: ["news", langInfo.name.toLowerCase()]
    };
  }
}

// server/rssEngine.ts
var CATEGORY_IMAGE_FALLBACKS = {
  "World News": "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
  "India News": "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1200&q=80",
  "Punjab News": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
  "Assam News": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
  "Technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "Artificial Intelligence": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  "Economy": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
  "Business": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  "Science": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80",
  "Sports": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
  "Default": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"
};
function parseXmlFeed(xmlText, feedSourceName, defaultCategory) {
  const items = [];
  const itemRegex = /<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi;
  const matches = xmlText.match(itemRegex) || [];
  for (const rawItem of matches) {
    const titleMatch = rawItem.match(/<title[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/i) || [];
    const title = (titleMatch[1] || titleMatch[2] || "").trim();
    const linkMatch = rawItem.match(/<link[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/link>/i) || rawItem.match(/<link[^>]*href=["']([^"']+)["']/i) || [];
    const link = (linkMatch[1] || linkMatch[2] || "").trim();
    const descMatch = rawItem.match(/<description[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/description>/i) || rawItem.match(/<content[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/content>/i) || rawItem.match(/<summary[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/summary>/i) || [];
    const description = (descMatch[1] || descMatch[2] || "").trim();
    const dateMatch = rawItem.match(/<pubDate[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/pubDate>/i) || rawItem.match(/<updated[^>]*>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/updated>/i) || [];
    const pubDate = (dateMatch[1] || dateMatch[2] || (/* @__PURE__ */ new Date()).toISOString()).trim();
    const mediaMatch = rawItem.match(/<media:content[^>]*url=["']([^"']+)["']/i) || rawItem.match(/<enclosure[^>]*url=["']([^"']+)["']/i) || rawItem.match(/<img[^>]*src=["']([^"']+)["']/i) || [];
    const imageUrl = mediaMatch[1] || void 0;
    if (title && (link || description)) {
      items.push({
        title: decodeXmlEntities(title),
        link: link || "https://groundzeronews.org",
        description: decodeXmlEntities(description),
        pubDate,
        source: feedSourceName,
        category: defaultCategory,
        imageUrl
      });
    }
  }
  return items;
}
function decodeXmlEntities(str) {
  return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}
var isEngineRunning = false;
var engineTimer = null;
async function runNewsAutomationCycle(manualTrigger = false) {
  if (isEngineRunning) {
    return {
      success: false,
      articlesProcessed: 0,
      newArticlesAdded: 0,
      message: "Automation cycle already in progress."
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
    let collectedRawItems = [];
    for (const feed of feeds) {
      try {
        console.log(`[NewsEngine] Fetching RSS feed: ${feed.name} (${feed.url})`);
        const res = await fetch(feed.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 GroundZeroNews/1.0 AI-Wire-Ingest",
            Accept: "application/rss+xml, application/xml, text/xml"
          },
          signal: AbortSignal.timeout(12e3)
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const xml = await res.text();
        const parsed = parseXmlFeed(xml, feed.name, feed.category);
        const unique = parsed.filter((item) => !existingUrls.has(item.link));
        collectedRawItems.push(...unique);
        db.updateFeed(feed.id, {
          lastFetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
          itemsFetchedCount: (feed.itemsFetchedCount || 0) + parsed.length,
          statusMessage: `OK (${parsed.length} items parsed)`
        });
      } catch (feedErr) {
        console.warn(`[NewsEngine] Feed fetch error for ${feed.name}:`, feedErr.message);
        db.updateFeed(feed.id, {
          statusMessage: `Error: ${feedErr.message}`
        });
      }
    }
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
        const fallbackImg = CATEGORY_IMAGE_FALLBACKS[res.category] || CATEGORY_IMAGE_FALLBACKS["Default"];
        const newArticle = {
          id: `gzn-ai-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
          originalLanguage: "en",
          currentLanguage: "en",
          headline: res.headline || item.title,
          summary: res.summary || item.description,
          fullBody: res.fullBody || `${res.summary}

(Report synthesized from verified wire reports.)`,
          category: res.category || item.category || "World News",
          tags: res.tags || ["Wire News", "AI Verified"],
          imageUrl: item.imageUrl || fallbackImg,
          imageCaption: `${res.headline} \u2014 Verified coverage from ${item.source}.`,
          imageCredit: `${item.source} / Authorized Wire Archive`,
          sourceName: item.source,
          sourceUrl: item.link,
          author: "Ground Zero AI Automation Desk",
          isAiGenerated: true,
          verificationStatus: res.verificationStatus || "confirmed",
          status: settings.autoPublishAiNews ? "published" : "pending_approval",
          isBreaking: false,
          isFeatured: false,
          isTrending: false,
          viewCount: Math.floor(Math.random() * 40) + 10,
          readingTimeMinutes: Math.max(2, Math.ceil((res.fullBody || "").split(" ").length / 200)),
          publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          commentsCount: 0,
          translations: {
            en: {
              language: "en",
              headline: res.headline,
              summary: res.summary,
              fullBody: res.fullBody,
              seoTitle: res.seoTitle || res.headline,
              seoDescription: res.seoDescription || res.summary.slice(0, 150),
              keywords: res.keywords || ["news"],
              translatedAt: (/* @__PURE__ */ new Date()).toISOString()
            },
            ...res.initialTranslations || {}
          }
        };
        db.createArticle(newArticle);
        newArticlesAdded++;
      }
    }
    const durationMs = Date.now() - startTime;
    db.updateSettings({ lastAutoRunAt: (/* @__PURE__ */ new Date()).toISOString() });
    db.addAiLog({
      id: `log-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      taskType: "rss_ingest",
      status: "success",
      source: manualTrigger ? "Manual Admin Trigger" : "Scheduled News Ingest",
      details: `Discovered ${collectedRawItems.length} wire items; processed ${itemsToProcess.length} items; saved ${newArticlesAdded} new articles. Auto-publish: ${settings.autoPublishAiNews ? "Enabled" : "Draft for Review"}.`,
      articlesProcessed: itemsToProcess.length,
      durationMs
    });
    console.log(`[NewsEngine] Cycle completed in ${durationMs}ms. Added ${newArticlesAdded} articles.`);
    return {
      success: true,
      articlesProcessed: itemsToProcess.length,
      newArticlesAdded,
      message: `Ingestion completed. Discovered ${collectedRawItems.length} wire items, added ${newArticlesAdded} new articles.`
    };
  } catch (error) {
    console.error("[NewsEngine] Cycle failed:", error);
    db.addAiLog({
      id: `log-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      taskType: "rss_ingest",
      status: "error",
      source: "News Engine",
      details: `Ingestion failed: ${error.message}`,
      articlesProcessed: 0,
      durationMs: Date.now() - startTime
    });
    return {
      success: false,
      articlesProcessed: 0,
      newArticlesAdded: 0,
      message: `Failed: ${error.message}`
    };
  } finally {
    isEngineRunning = false;
  }
}
function initNewsEngineScheduler() {
  const settings = db.getSettings();
  const intervalMinutes = settings.automationIntervalMinutes || 15;
  const intervalMs = intervalMinutes * 60 * 1e3;
  if (engineTimer) {
    clearInterval(engineTimer);
  }
  console.log(`[NewsEngine] Scheduled recurring automation interval: Every ${intervalMinutes} minutes.`);
  engineTimer = setInterval(() => {
    runNewsAutomationCycle(false).catch(
      (err) => console.error("[NewsEngine] Background cycle exception:", err)
    );
  }, intervalMs);
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
var isProd = process.env.NODE_ENV === "production";
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.get("/api/news/articles", (req, res) => {
  try {
    const { category, language, search, breaking, trending, featured, status, limit, offset } = req.query;
    const result = db.getArticles({
      category: category ? String(category) : void 0,
      language: language ? String(language) : "en",
      search: search ? String(search) : void 0,
      breaking: breaking !== void 0 ? breaking === "true" : void 0,
      trending: trending !== void 0 ? trending === "true" : void 0,
      featured: featured !== void 0 ? featured === "true" : void 0,
      status: status ? String(status) : void 0,
      limit: limit ? parseInt(String(limit), 10) : 50,
      offset: offset ? parseInt(String(offset), 10) : 0
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/news/articles/:id", (req, res) => {
  try {
    const { language } = req.query;
    const article = db.getArticleById(
      req.params.id,
      language ? String(language) : "en"
    );
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/news/translate-article", async (req, res) => {
  try {
    const { articleId, targetLanguage } = req.body;
    if (!articleId || !targetLanguage) {
      return res.status(400).json({ error: "Missing articleId or targetLanguage" });
    }
    const article = db.getArticleById(articleId);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    if (article.translations && article.translations[targetLanguage]) {
      return res.json({
        cached: true,
        translation: article.translations[targetLanguage]
      });
    }
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
      translatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.saveTranslation(articleId, fullTranslation);
    res.json({
      cached: false,
      translation: fullTranslation
    });
  } catch (err) {
    console.error("[Translate API] Error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/articles", (_req, res) => {
  try {
    const articles = db.getAllAdminArticles();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/news/articles", (req, res) => {
  try {
    const body = req.body;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newArticle = {
      id: `gzn-${Date.now()}`,
      originalLanguage: body.originalLanguage || "en",
      headline: body.headline,
      summary: body.summary,
      fullBody: body.fullBody || body.summary,
      category: body.category || "World News",
      tags: body.tags || [],
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
      imageCaption: body.imageCaption,
      imageCredit: body.imageCredit,
      sourceName: body.sourceName || "Ground Zero Newsroom",
      sourceUrl: body.sourceUrl || "https://groundzeronews.org",
      author: body.author || "Ground Zero Editorial Desk",
      isAiGenerated: body.isAiGenerated || false,
      verificationStatus: body.verificationStatus || "confirmed",
      status: body.status || "published",
      isBreaking: body.isBreaking || false,
      isFeatured: body.isFeatured || false,
      isTrending: body.isTrending || false,
      viewCount: 0,
      readingTimeMinutes: Math.max(1, Math.ceil((body.fullBody || body.summary || "").split(" ").length / 200)),
      publishedAt: body.publishedAt || now,
      updatedAt: now,
      commentsCount: 0,
      translations: {
        en: {
          language: "en",
          headline: body.headline,
          summary: body.summary,
          fullBody: body.fullBody,
          seoTitle: body.headline,
          seoDescription: body.summary.slice(0, 150),
          keywords: body.tags || ["news"],
          translatedAt: now
        }
      }
    };
    const created = db.createArticle(newArticle);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/news/articles/:id", (req, res) => {
  try {
    const updated = db.updateArticle(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/news/articles/:id", (req, res) => {
  try {
    const success = db.deleteArticle(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/news/process-rss", async (_req, res) => {
  try {
    const result = await runNewsAutomationCycle(true);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/news/comments/:articleId", (req, res) => {
  try {
    const comments = db.getComments(req.params.articleId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/news/comments", (req, res) => {
  try {
    const { articleId, userName, userEmail, content } = req.body;
    if (!articleId || !userName || !content) {
      return res.status(400).json({ error: "Missing required comment fields" });
    }
    const comment = db.addComment({
      id: `comm-${Date.now()}`,
      articleId,
      userName,
      userEmail,
      content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "approved",
      likes: 0
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/feeds", (_req, res) => {
  res.json(db.getFeeds());
});
app.post("/api/feeds", (req, res) => {
  try {
    const { name, url, category, language } = req.body;
    const newFeed = db.addFeed({
      id: `feed-${Date.now()}`,
      name,
      url,
      category: category || "World News",
      language: language || "en",
      isActive: true,
      itemsFetchedCount: 0,
      statusMessage: "Ready for ingestion"
    });
    res.status(201).json(newFeed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/feeds/:id", (req, res) => {
  try {
    const updated = db.updateFeed(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Feed not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/feeds/:id", (req, res) => {
  try {
    const deleted = db.deleteFeed(req.params.id);
    res.json({ success: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/settings", (_req, res) => {
  res.json(db.getSettings());
});
app.put("/api/settings", (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    if (req.body.automationIntervalMinutes) {
      initNewsEngineScheduler();
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/ads", (_req, res) => {
  res.json(db.getAds());
});
app.post("/api/ads", (req, res) => {
  try {
    const ad = db.saveAd({
      ...req.body,
      id: req.body.id || `ad-${Date.now()}`,
      impressions: req.body.impressions || 0,
      clicks: req.body.clicks || 0
    });
    res.json(ad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/ads/:id", (req, res) => {
  const success = db.deleteAd(req.params.id);
  res.json({ success });
});
app.post("/api/ads/:id/impression", (req, res) => {
  db.incrementAdMetric(req.params.id, "impression");
  res.json({ success: true });
});
app.post("/api/ads/:id/click", (req, res) => {
  db.incrementAdMetric(req.params.id, "click");
  res.json({ success: true });
});
app.get("/api/stats", (_req, res) => {
  res.json(db.getStats());
});
app.get("/api/logs", (_req, res) => {
  res.json(db.getAiLogs());
});
app.post("/api/newsletter", (req, res) => {
  const { email, language } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }
  res.json({
    success: true,
    message: `Subscribed ${email} to Ground Zero News daily briefings (${language || "English"}).`
  });
});
app.post("/api/push-subscribe", (req, res) => {
  res.json({
    success: true,
    message: "Browser push notifications successfully configured for Ground Zero breaking alerts."
  });
});
app.get("/api/export/schema.sql", (_req, res) => {
  const schemaPath = path2.resolve("src/db/schema.sql");
  res.download(schemaPath, "ground_zero_news_schema.sql");
});
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  const baseUrl = process.env.APP_URL || "https://groundzeronews.org";
  res.send([
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api/",
    "",
    `Sitemap: ${baseUrl}/sitemap.xml`,
    `Sitemap: ${baseUrl}/news-sitemap.xml`
  ].join("\n"));
});
app.get("/sitemap.xml", (_req, res) => {
  const { articles } = db.getArticles({ limit: 1e3 });
  const baseUrl = process.env.APP_URL || "https://groundzeronews.org";
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
  xml += `
</urlset>`;
  res.type("application/xml");
  res.send(xml);
});
app.get("/news-sitemap.xml", (_req, res) => {
  const { articles } = db.getArticles({ limit: 50 });
  const baseUrl = process.env.APP_URL || "https://groundzeronews.org";
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;
  for (const art of articles) {
    const pubDate = new Date(art.publishedAt).toISOString();
    const lang = art.originalLanguage || "en";
    const escapedTitle = art.headline.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  xml += `
</urlset>`;
  res.type("application/xml");
  res.send(xml);
});
app.get("/api/rss.xml", (_req, res) => {
  const { articles } = db.getArticles({ limit: 30 });
  const baseUrl = process.env.APP_URL || "https://groundzeronews.org";
  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Ground Zero News \u2013 Truth First. News Everywhere.</title>
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
  res.type("application/rss+xml");
  res.send(xml);
});
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path2.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`GROUND ZERO NEWS Server running on port ${PORT}`);
    console.log(`Tagline: Truth First. News Everywhere.`);
    console.log(`API endpoints ready. Google News sitemaps active.`);
    console.log(`====================================================`);
    initNewsEngineScheduler();
  });
}
startServer().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
});

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { NewsProvider, useNews } from './context/NewsContext';
import { Navbar } from './components/Navbar';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { CategoryBar } from './components/CategoryBar';
import { HeroFeatured } from './components/HeroFeatured';
import { LeadGrid } from './components/LeadGrid';
import { ArticleCard } from './components/ArticleCard';
import { TrendingSidebar } from './components/TrendingSidebar';
import { ArticleModal } from './components/ArticleModal';
import { AdminDashboard } from './components/AdminDashboard';
import { EditorialGuidelines } from './components/EditorialGuidelines';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Footer } from './components/Footer';
import { NEWS_CATEGORIES } from './constants/categories';
import { Loader2, AlertCircle, Sparkles, Filter, Rss } from 'lucide-react';

const MainNewsPortal: React.FC = () => {
  const {
    category,
    searchQuery,
    articles,
    featuredArticle,
    activeView,
    isLoading,
    toast,
  } = useNews();

  // If in admin dashboard mode
  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1">
          <AdminDashboard />
        </main>
        <Footer />
        <ArticleModal />
        <OfflineIndicator />
      </div>
    );
  }

  // If in guidelines mode
  if (activeView === 'guidelines') {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1">
          <EditorialGuidelines />
        </main>
        <Footer />
        <ArticleModal />
        <OfflineIndicator />
      </div>
    );
  }

  const isDefaultHome = category === 'All' && !searchQuery.trim();
  const currentCategoryMeta = NEWS_CATEGORIES.find(
    (c) => c.name.toLowerCase() === category.toLowerCase()
  );

  // Articles for the feed (skip featured only on default home)
  const feedArticles = isDefaultHome
    ? articles.filter((a) => a.id !== featuredArticle?.id).slice(4) // Skip hero + lead grid
    : articles;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl bg-red-600 text-white px-4 py-2.5 text-xs font-bold shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Global Ticker */}
      <Navbar />
      <BreakingNewsTicker />
      <CategoryBar />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {isLoading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <p className="text-sm font-semibold text-slate-400">
              Connecting to Ground Zero News Wire & AI Synthesis Nodes...
            </p>
          </div>
        ) : (
          <>
            {/* Show Featured Lead and 4-Card Grid only on standard Home View */}
            {isDefaultHome && (
              <>
                <HeroFeatured />
                <LeadGrid />
              </>
            )}

            {/* Dedicated Category / Search Header when filtered */}
            {!isDefaultHome && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 mb-8 text-white">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                  <Filter className="w-4 h-4" />
                  <span>{searchQuery ? 'Search Query Results' : 'Desk Special Dispatch'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans']">
                  {searchQuery ? `Searching for: "${searchQuery}"` : category}
                </h1>
                {currentCategoryMeta?.description && !searchQuery && (
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl">
                    {currentCategoryMeta.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                  <span>Found {articles.length} verified reports</span>
                  <span>•</span>
                  <span>Real-time AI multilingual translations available</span>
                </div>
              </div>
            )}

            {/* Main Content + Sidebar Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: News Feed */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                      {isDefaultHome ? 'Continuous Wire Stream' : `${category} Wire`}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {feedArticles.length} Stories Available
                  </span>
                </div>

                {feedArticles.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-sm font-semibold">No articles found matching this filter.</p>
                    <p className="text-xs">
                      Try selecting another category or triggering an automated AI wire ingest from the Admin Desk.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Trending, Ad, Newsletter */}
              <div className="lg:col-span-4">
                <TrendingSidebar />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Global Article Modal */}
      <ArticleModal />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NewsProvider>
        <MainNewsPortal />
      </NewsProvider>
    </AuthProvider>
  );
}

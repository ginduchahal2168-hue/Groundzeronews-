import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import { NEWS_CATEGORIES } from '../constants/categories';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from '../constants/languages';
import {
  NewsArticle,
  RssFeed,
  Advertisement,
  SiteSettings,
  AiAutomationLog,
  UserRole,
} from '../types';
import {
  Shield,
  Layers,
  Cpu,
  Radio,
  Globe,
  DollarSign,
  FileText,
  BarChart3,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Flame,
  ExternalLink,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { setActiveView, triggerAiAutomation, refreshArticles, showToast } = useNews();
  const { user, role, switchRole, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'articles' | 'ai_engine' | 'feeds' | 'languages' | 'ads' | 'seo' | 'analytics'
  >('articles');

  // Articles state
  const [adminArticles, setAdminArticles] = useState<NewsArticle[]>([]);
  const [articleFilter, setArticleFilter] = useState<'all' | 'pending_approval' | 'published' | 'draft'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newHeadline, setNewHeadline] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newCategory, setNewCategory] = useState(NEWS_CATEGORIES[0].name);
  const [newSource, setNewSource] = useState('Ground Zero Investigative Desk');
  const [newSourceUrl, setNewSourceUrl] = useState('https://groundzeronews.org');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80');

  // Feeds state
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [isAddFeedModalOpen, setIsAddFeedModalOpen] = useState(false);
  const [feedName, setFeedName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [feedCategory, setFeedCategory] = useState(NEWS_CATEGORIES[0].name);

  // Settings & Engine state
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isEngineTriggering, setIsEngineTriggering] = useState(false);

  // Ads state
  const [ads, setAds] = useState<Advertisement[]>([]);

  // Logs & Stats state
  const [logs, setLogs] = useState<AiAutomationLog[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      const [artRes, feedRes, setRes, adsRes, statsRes, logRes] = await Promise.all([
        fetch('/api/admin/articles'),
        fetch('/api/feeds'),
        fetch('/api/settings'),
        fetch('/api/ads'),
        fetch('/api/stats'),
        fetch('/api/logs'),
      ]);

      if (artRes.ok) setAdminArticles(await artRes.json());
      if (feedRes.ok) setFeeds(await feedRes.json());
      if (setRes.ok) setSettings(await setRes.json());
      if (adsRes.ok) setAds(await adsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (logRes.ok) setLogs(await logRes.json());
    } catch (err) {
      console.error('[Admin] Load data error:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Actions on Articles
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/news/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Article status updated to ${status}.`);
        loadAdminData();
        refreshArticles();
      }
    } catch (e) {
      showToast('Error updating article status.');
    }
  };

  const handleToggleBreaking = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/news/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBreaking: !current }),
      });
      if (res.ok) {
        showToast(`Breaking alert ${!current ? 'ACTIVATED' : 'DEACTIVATED'}.`);
        loadAdminData();
        refreshArticles();
      }
    } catch (e) {
      showToast('Error updating breaking status.');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/news/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Article deleted from wire.');
        loadAdminData();
        refreshArticles();
      }
    } catch (e) {
      showToast('Error deleting article.');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadline.trim() || !newSummary.trim()) return;

    try {
      const res = await fetch('/api/news/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: newHeadline,
          summary: newSummary,
          fullBody: newSummary,
          category: newCategory,
          sourceName: newSource,
          sourceUrl: newSourceUrl,
          imageUrl: newImageUrl,
          status: 'published',
          author: `${user?.name || 'Editorial Desk'} (Staff)`,
        }),
      });

      if (res.ok) {
        showToast('New article published to wire!');
        setIsCreateModalOpen(false);
        setNewHeadline('');
        setNewSummary('');
        loadAdminData();
        refreshArticles();
      }
    } catch (e) {
      showToast('Error creating article.');
    }
  };

  // AI News Engine Trigger
  const handleTriggerEngine = async () => {
    setIsEngineTriggering(true);
    try {
      await triggerAiAutomation();
      await loadAdminData();
    } finally {
      setIsEngineTriggering(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<SiteSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setSettings(await res.json());
        showToast('Settings saved successfully.');
      }
    } catch (e) {
      showToast('Error saving settings.');
    }
  };

  // RSS Feed Management
  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName.trim() || !feedUrl.trim()) return;

    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: feedName,
          url: feedUrl,
          category: feedCategory,
        }),
      });
      if (res.ok) {
        showToast('New RSS feed added to automated pipeline.');
        setIsAddFeedModalOpen(false);
        setFeedName('');
        setFeedUrl('');
        loadAdminData();
      }
    } catch (e) {
      showToast('Error adding feed.');
    }
  };

  const handleDeleteFeed = async (id: string) => {
    try {
      const res = await fetch(`/api/feeds/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Feed deleted.');
        loadAdminData();
      }
    } catch (e) {
      showToast('Error deleting feed.');
    }
  };

  const filteredArticles = adminArticles.filter((a) => {
    if (articleFilter === 'all') return true;
    return a.status === articleFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Admin Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-red-600/20 text-red-400">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-red-500">
              Ground Zero Newsroom Terminal
            </span>
          </div>
          <h1 className="text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
            Editorial & AI Automation Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-slate-200">{user?.name}</strong> ({user?.email}) • Active Role:{' '}
            <span className="uppercase text-red-400 font-bold">{role.replace('_', ' ')}</span>
          </p>
        </div>

        {/* Role Switcher & Exit */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 font-bold px-1.5">ROLE:</span>
            {(['super_admin', 'editor', 'journalist', 'moderator'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                  role === r
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveView('home')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            Return to Portal
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {[
          { id: 'articles', label: 'Articles & Approval', icon: Layers, count: adminArticles.length },
          { id: 'ai_engine', label: 'AI News Engine', icon: Cpu },
          { id: 'feeds', label: 'RSS & News APIs', icon: Radio, count: feeds.length },
          { id: 'languages', label: '19 Languages', icon: Globe, count: 19 },
          { id: 'ads', label: 'Monetization & Ads', icon: DollarSign, count: ads.length },
          { id: 'seo', label: 'Google News & SEO', icon: FileText },
          { id: 'analytics', label: 'Audit Logs & Stats', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition shadow-sm ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    isActive ? 'bg-red-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARTICLES & EDITORIAL APPROVAL */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Status:</span>
              {(['all', 'pending_approval', 'published', 'draft'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setArticleFilter(st)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold capitalize transition ${
                    articleFilter === st
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Draft Manual Article</span>
            </button>
          </div>

          {/* Article List Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Headline & Category</th>
                    <th className="p-4">Source / Origin</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Breaking</th>
                    <th className="p-4">Translations</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 max-w-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-red-400 border border-slate-700">
                            {art.category}
                          </span>
                          {art.isAiGenerated && (
                            <span className="flex items-center gap-0.5 text-cyan-400 text-[10px]">
                              <Sparkles className="w-3 h-3" />
                              AI Synthesized
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-white line-clamp-2 leading-snug font-['Lora',serif]">
                          {art.headline}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap text-slate-400">
                        <div className="font-semibold text-slate-200">{art.sourceName}</div>
                        <div className="text-[10px] text-slate-500">{new Date(art.publishedAt).toLocaleDateString()}</div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            art.status === 'published'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : art.status === 'pending_approval'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {art.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleBreaking(art.id, art.isBreaking)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                            art.isBreaking
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>{art.isBreaking ? 'ACTIVE' : 'Off'}</span>
                        </button>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40 font-bold text-[10px]">
                          {Object.keys(art.translations || {}).length} / 19 Langs
                        </span>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {art.status !== 'published' && (
                            <button
                              onClick={() => handleUpdateStatus(art.id, 'published')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow"
                              title="Approve and Publish to Wire"
                            >
                              Approve
                            </button>
                          )}
                          {art.status === 'published' && (
                            <button
                              onClick={() => handleUpdateStatus(art.id, 'pending_approval')}
                              className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-[11px] transition"
                              title="Unpublish"
                            >
                              Unpublish
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1 rounded-lg hover:bg-red-600 hover:text-white text-slate-400 transition"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI NEWS AUTOMATION ENGINE */}
      {activeTab === 'ai_engine' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">AI Wire Synthesizer</h3>
              </div>
              <div className="text-xl font-black text-white font-['Plus_Jakarta_Sans']">
                gemini-3.8-flash
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero hallucination protocol with real-time multi-source fact cross-verification.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Clock className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Scheduler Interval</h3>
              </div>
              <div className="text-xl font-black text-white">
                Every {settings?.automationIntervalMinutes || 15} Minutes
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Last executed: {settings?.lastAutoRunAt ? new Date(settings.lastAutoRunAt).toLocaleTimeString() : 'Active'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <Shield className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Editorial Gatekeeping</h3>
              </div>
              <div className="text-xl font-black text-white">
                {settings?.autoPublishAiNews ? 'Automatic Publishing' : 'Manual Review Required'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {settings?.autoPublishAiNews
                  ? 'Wire reports go live immediately after deduplication.'
                  : 'Synthesized reports queued in Draft/Pending for editor sign-off.'}
              </p>
            </div>
          </div>

          {/* Engine Controls */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-[#0e172e] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                  Automated Wire Ingestion & Synthesis Control
                </h2>
                <p className="text-xs text-slate-400">
                  Discovers newly published RSS feed dispatches, removes duplicates, summarizes facts, and generates multi-lingual versions.
                </p>
              </div>

              <button
                onClick={handleTriggerEngine}
                disabled={isEngineTriggering}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xl transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isEngineTriggering ? 'animate-spin' : ''}`} />
                <span>{isEngineTriggering ? 'Running Ingestion Cycle...' : 'Trigger Wire Fetch & AI Process Now'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Scheduled Automation Interval:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 15, 30, 60].map((interval) => (
                    <button
                      key={interval}
                      onClick={() => handleUpdateSettings({ automationIntervalMinutes: interval as any })}
                      className={`py-2 rounded-xl text-xs font-bold transition ${
                        settings?.automationIntervalMinutes === interval
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {interval} Min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Publishing Workflow Policy:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateSettings({ autoPublishAiNews: false })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                      !settings?.autoPublishAiNews
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Human Approval First (Recommended)
                  </button>
                  <button
                    onClick={() => handleUpdateSettings({ autoPublishAiNews: true })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                      settings?.autoPublishAiNews
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Instant Auto-Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RSS FEEDS */}
      {activeTab === 'feeds' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Connected Wire Feeds & Authorized Sources</h3>
              <p className="text-xs text-slate-400">Automated ingestion nodes configured for real-time polling.</p>
            </div>
            <button
              onClick={() => setIsAddFeedModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom RSS Feed</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-red-400 border border-slate-700">
                    {feed.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400">
                      {feed.statusMessage || 'Active'}
                    </span>
                    <button
                      onClick={() => handleDeleteFeed(feed.id)}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{feed.name}</h4>
                <p className="text-xs font-mono text-slate-400 truncate mb-3">{feed.url}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>Fetched: {feed.itemsFetchedCount || 0} items</span>
                  <span>
                    Last poll: {feed.lastFetchedAt ? new Date(feed.lastFetchedAt).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 19 MULTILINGUAL LANGUAGES */}
      {activeTab === 'languages' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">19 Official Multilingual Reporting Desks</h3>
            <p className="text-xs text-slate-400">
              Ground Zero News supports native script rendering and bidirectional typography for all 19 global and regional languages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{lang.nativeName}</span>
                    <span className="text-xs text-slate-400 font-medium">({lang.name})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Code: {lang.code} {lang.isRTL ? '• RTL Layout' : '• LTR Layout'}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  Online
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MONETIZATION & ADS */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white">Monetization & Verified Sponsorship Inventory</h3>
            <p className="text-xs text-slate-400">Manage verified advertising placements and sponsor campaigns.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div key={ad.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    Location: {ad.location}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400">
                    {ad.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{ad.title}</h4>
                <div className="text-xs text-slate-400 mb-3">Sponsor: {ad.sponsorName}</div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Impressions</span>
                    <strong className="text-slate-200">{ad.impressions.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Clicks</span>
                    <strong className="text-red-400">{ad.clicks.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: GOOGLE NEWS & SEO */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              Search Engine Optimization & Google News Hub
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ground Zero News implements full Google Search Console compatibility, NewsArticle JSON-LD structured data, News XML Sitemap, and standard XML Sitemaps.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <a
                href="/news-sitemap.xml"
                target="_blank"
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-500 transition group block"
              >
                <div className="text-xs font-bold text-red-400 uppercase mb-1">Google News Sitemap</div>
                <div className="text-sm font-mono text-white group-hover:underline">/news-sitemap.xml</div>
                <p className="text-[11px] text-slate-500 mt-1">Dedicated publication XML for Google News ingestion.</p>
              </a>

              <a
                href="/sitemap.xml"
                target="_blank"
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-500 transition group block"
              >
                <div className="text-xs font-bold text-red-400 uppercase mb-1">Web Sitemap</div>
                <div className="text-sm font-mono text-white group-hover:underline">/sitemap.xml</div>
                <p className="text-[11px] text-slate-500 mt-1">Complete canonical URL indexing across articles.</p>
              </a>

              <a
                href="/robots.txt"
                target="_blank"
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-500 transition group block"
              >
                <div className="text-xs font-bold text-red-400 uppercase mb-1">Robots Directives</div>
                <div className="text-sm font-mono text-white group-hover:underline">/robots.txt</div>
                <p className="text-[11px] text-slate-500 mt-1">Search crawler permissions and indexing boundaries.</p>
              </a>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">Production Database Migration</div>
                <div className="text-[11px] text-slate-400">Download complete Supabase / PostgreSQL schema with Row Level Security.</div>
              </div>
              <a
                href="/api/export/schema.sql"
                download="ground_zero_news_schema.sql"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PostgreSQL Schema</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: ANALYTICS & LOGS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Articles</span>
                <span className="text-2xl font-black text-white">{stats.totalArticles}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Article Reads</span>
                <span className="text-2xl font-black text-red-400">{stats.totalViews.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Translations Stored</span>
                <span className="text-2xl font-black text-cyan-400">{stats.totalTranslations}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Active RSS Wire Nodes</span>
                <span className="text-2xl font-black text-emerald-400">{stats.activeFeeds}</span>
              </div>
            </div>
          )}

          {/* Audit Logs Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3">AI Automation & Editorial Audit Trail</h3>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          log.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-red-950 text-red-400'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="font-bold text-white">{log.source}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({log.taskType})</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{log.details}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 whitespace-nowrap">
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div>{log.durationMs}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE ARTICLE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold">Publish Manual News Article</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Headline</label>
                <input
                  type="text"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {NEWS_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Source Name</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Article Summary & Body</label>
                <textarea
                  rows={4}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white"
                >
                  Publish Immediately
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD RSS FEED MODAL */}
      {isAddFeedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold">Add RSS Ingestion Feed</h3>
              <button
                onClick={() => setIsAddFeedModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddFeed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Feed Name</label>
                <input
                  type="text"
                  placeholder="e.g. Associated Press Wire"
                  value={feedName}
                  onChange={(e) => setFeedName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">RSS XML URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Default Category</label>
                <select
                  value={feedCategory}
                  onChange={(e) => setFeedCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {NEWS_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddFeedModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white"
                >
                  Save Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

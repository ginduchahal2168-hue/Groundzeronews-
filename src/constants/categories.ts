import type { NewsCategory } from '../types/index.ts';

export interface CategoryMeta {
  name: NewsCategory;
  slug: string;
  badgeColor: string;
  description: string;
  iconName: string;
}

export const NEWS_CATEGORIES: CategoryMeta[] = [
  { name: 'Breaking News', slug: 'breaking-news', badgeColor: 'bg-red-600 text-white', description: 'Urgent confirmed reports and developing geopolitical flashpoints.', iconName: 'Flame' },
  { name: 'India News', slug: 'india-news', badgeColor: 'bg-orange-600 text-white', description: 'National governance, supreme court developments, and civic policy across India.', iconName: 'Globe' },
  { name: 'World News', slug: 'world-news', badgeColor: 'bg-blue-600 text-white', description: 'Global diplomacy, international conflicts, UN summits, and trade treaties.', iconName: 'Globe2' },
  { name: 'Punjab News', slug: 'punjab-news', badgeColor: 'bg-amber-600 text-white', description: 'Grassroots reporting, agrarian economy, and community updates from Punjab.', iconName: 'MapPin' },
  { name: 'Assam News', slug: 'assam-news', badgeColor: 'bg-emerald-700 text-white', description: 'Northeast corridors, Brahmaputra conservation, and Assam governance.', iconName: 'Compass' },
  { name: 'Politics', slug: 'politics', badgeColor: 'bg-purple-700 text-white', description: 'Elections, legislative bills, parliamentary debates, and political analysis.', iconName: 'Landmark' },
  { name: 'Business', slug: 'business', badgeColor: 'bg-indigo-600 text-white', description: 'Corporate mergers, global supply chains, startups, and executive movements.', iconName: 'Briefcase' },
  { name: 'Economy', slug: 'economy', badgeColor: 'bg-emerald-600 text-white', description: 'Central bank rates, inflation, GDP data, foreign exchange, and fiscal policies.', iconName: 'TrendingUp' },
  { name: 'Technology', slug: 'technology', badgeColor: 'bg-cyan-600 text-white', description: 'Semiconductors, cybersecurity, mobile innovation, and quantum computing.', iconName: 'Cpu' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence', badgeColor: 'bg-violet-600 text-white', description: 'Frontier AI models, autonomous robotics, agentic intelligence, and ethics.', iconName: 'Sparkles' },
  { name: 'Science', slug: 'science', badgeColor: 'bg-teal-600 text-white', description: 'Space exploration, astrophysics, clean fusion, and bio-engineering discoveries.', iconName: 'Atom' },
  { name: 'Sports', slug: 'sports', badgeColor: 'bg-sky-600 text-white', description: 'Cricket, Olympics, football, tennis championships, and athlete profiles.', iconName: 'Trophy' },
  { name: 'Entertainment', slug: 'entertainment', badgeColor: 'bg-pink-600 text-white', description: 'Cinema, global streaming, music, film festivals, and cultural spotlights.', iconName: 'Film' },
  { name: 'Education', slug: 'education', badgeColor: 'bg-blue-500 text-white', description: 'University breakthroughs, educational reform, STEM programs, and careers.', iconName: 'GraduationCap' },
  { name: 'Health', slug: 'health', badgeColor: 'bg-rose-600 text-white', description: 'Medical research, epidemiology, biotechnology, and public healthcare policies.', iconName: 'HeartPulse' },
  { name: 'Crime', slug: 'crime', badgeColor: 'bg-zinc-800 text-white', description: 'Law enforcement investigations, cybercrime syndicates, and court trials.', iconName: 'ShieldAlert' },
  { name: 'Defence', slug: 'defence', badgeColor: 'bg-stone-700 text-white', description: 'Armed forces modernization, aerospace defense systems, and border security.', iconName: 'Shield' },
  { name: 'Agriculture', slug: 'agriculture', badgeColor: 'bg-lime-700 text-white', description: 'Crop science, minimum support prices, precision farming, and food security.', iconName: 'Sprout' },
  { name: 'Weather', slug: 'weather', badgeColor: 'bg-cyan-700 text-white', description: 'Monsoon trajectories, extreme meteorological forecasts, and climate trends.', iconName: 'CloudRain' },
  { name: 'Lifestyle', slug: 'lifestyle', badgeColor: 'bg-fuchsia-600 text-white', description: 'Urban living, architecture, travel journals, and cultural heritage.', iconName: 'Coffee' },
  { name: 'Viral News', slug: 'viral-news', badgeColor: 'bg-amber-500 text-slate-900', description: 'Global internet phenomena, trending moments, and cultural sensations.', iconName: 'Zap' },
  { name: 'Opinion', slug: 'opinion', badgeColor: 'bg-slate-700 text-white', description: 'Editorial viewpoints, expert commentary, and guest geopolitical essays.', iconName: 'PenTool' },
  { name: 'Exclusive Reports', slug: 'exclusive-reports', badgeColor: 'bg-red-700 text-white', description: 'Ground Zero investigative reporting, whistleblower dossiers, and scoops.', iconName: 'Lock' },
];

export const ALL_CATEGORIES = NEWS_CATEGORIES.map(c => c.name);

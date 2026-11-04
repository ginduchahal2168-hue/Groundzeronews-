import React, { useRef } from 'react';
import { useNews } from '../context/NewsContext';
import { NEWS_CATEGORIES } from '../constants/categories';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export const CategoryBar: React.FC = () => {
  const { category, setCategory } = useNews();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#070c18] border-b border-slate-800 text-slate-200 select-none sticky top-16 sm:top-20 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex items-center justify-center p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white mr-1 shadow-sm transition"
            title="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Categories Horizontal Carousel */}
          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar scroll-smooth flex-1"
          >
            {/* All Category Pill */}
            <button
              onClick={() => setCategory('All')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                category === 'All'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Wire News</span>
            </button>

            {/* All 23 Categories */}
            {NEWS_CATEGORIES.map((cat) => {
              const isActive = category.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md font-bold'
                      : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex items-center justify-center p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white ml-1 shadow-sm transition"
            title="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

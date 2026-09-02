import React from 'react';
import { Search } from 'lucide-react';
import { triggerHaptic } from '../utils/hapticsService';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  totalResults: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalResults,
}) => {
  const handleCategorySelect = (cat: string) => {
    triggerHaptic('light');
    onCategoryChange(cat);
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] transition-colors"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Counter Badge */}
        <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
          Showing <strong className="text-purple-700 font-extrabold">{totalResults}</strong> {totalResults === 1 ? 'buddy' : 'buddies'}
        </div>
      </div>

      {/* Relationship Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              type="button"
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

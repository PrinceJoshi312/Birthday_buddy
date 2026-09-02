import React from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  isSearching: boolean;
  onOpenAddModal: () => void;
  onClearSearch: () => void;
  onSeedSampleData?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearching,
  onOpenAddModal,
  onClearSearch,
  onSeedSampleData,
}) => {
  if (isSearching) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-3xl border border-warm-200/80 shadow-soft max-w-md mx-auto my-6 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
          <Search className="w-7 h-7" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800 mb-1">No matches found</h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          We couldn't find anyone matching your search or category filter.
        </p>
        <button
          type="button"
          onClick={onClearSearch}
          className="px-5 py-2.5 rounded-xl bg-warm-100 hover:bg-warm-200 text-slate-700 font-bold text-xs transition-colors shadow-sm"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-6 bg-white rounded-3xl border border-warm-200/80 shadow-soft max-w-md mx-auto my-6 animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white flex items-center justify-center mx-auto mb-4 shadow-soft">
        <span className="text-3xl leading-none">🎂</span>
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-2">No Birthdays Yet</h3>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
        Add your closest friends, family, and coworkers to see their upcoming birthdays and countdowns here!
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add First Birthday</span>
        </button>

        {onSeedSampleData && (
          <button
            type="button"
            onClick={onSeedSampleData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-warm-100 hover:bg-warm-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Load Sample Data</span>
          </button>
        )}
      </div>
    </div>
  );
};

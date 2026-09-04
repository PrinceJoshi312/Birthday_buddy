import React from 'react';
import { Plus, Settings, Users, Home } from 'lucide-react';

interface HeaderProps {
  activeTab?: 'home' | 'buddies';
  onSelectTab?: (tab: 'home' | 'buddies') => void;
  onOpenAddModal: () => void;
  onOpenSettings?: () => void;
  totalCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'home',
  onSelectTab,
  onOpenAddModal,
  onOpenSettings,
  totalCount = 0,
}) => {
  const handleLogoClick = () => {
    if (onSelectTab) {
      onSelectTab('home');
    }
  };

  return (
    <header 
      className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-warm-200/70 px-3 sm:px-8 pb-3 transition-all"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Subtitle */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-soft text-white transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-200 flex-shrink-0">
            <span className="text-xl sm:text-2xl leading-none">🎂</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-800 whitespace-nowrap">
                Birthday<span className="gradient-text font-black">Buddy</span>
              </h1>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 font-medium tracking-tight truncate">
              Never forget someone important.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        {onSelectTab && (
          <div className="hidden md:flex items-center gap-1.5 bg-warm-100/80 p-1 rounded-2xl border border-warm-200/70">
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('buddies')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'buddies'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Buddies ({totalCount})</span>
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Settings & Backup"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white hover:bg-warm-100/80 border border-warm-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors shadow-sm active:scale-95 flex-shrink-0"
            aria-label="Settings & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Prominent + Add Person Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all duration-200 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add<span className="hidden min-[380px]:inline"> Person</span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

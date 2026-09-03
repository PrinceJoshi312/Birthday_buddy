import React from 'react';
import { Home, Plus, Users } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'buddies';
  onSelectTab: (tab: 'home' | 'buddies') => void;
  onOpenAddModal: () => void;
  totalCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  totalCount = 0,
}) => {
  const handleHomeClick = () => {
    onSelectTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuddiesClick = () => {
    onSelectTab('buddies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-warm-200/80 shadow-lg"
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="grid grid-cols-3 items-center w-full max-w-md mx-auto pt-2.5 px-4">
        {/* Left: Home Navigation Tab */}
        <button
          type="button"
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] active:scale-95 transition-all ${
            activeTab === 'home'
              ? 'text-purple-700 font-extrabold'
              : 'text-slate-500 hover:text-purple-700 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span>Home</span>
        </button>

        {/* Center: Prominent floating Add CTA (Geometrically Centered at 50% screen width) */}
        <div className="flex justify-center items-center">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white flex items-center justify-center shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all"
            title="Add Birthday"
            aria-label="Add Birthday"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Right: Dedicated Buddies Screen Tab */}
        <button
          type="button"
          onClick={handleBuddiesClick}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] active:scale-95 transition-all ${
            activeTab === 'buddies'
              ? 'text-purple-700 font-extrabold'
              : 'text-slate-500 hover:text-purple-700 font-medium'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'buddies' ? 'stroke-[2.5]' : ''}`} />
          <span>Buddies</span>
        </button>
      </div>
    </nav>
  );
};

import React from 'react';
import { Home, Plus, Users } from 'lucide-react';
import { triggerHaptic } from '../utils/hapticsService';

interface BottomNavProps {
  onOpenAddModal: () => void;
  onGoHome?: () => void;
  onGoBuddies?: () => void;
  totalCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenAddModal,
  onGoHome,
  onGoBuddies,
  totalCount,
}) => {
  const handleHomeClick = () => {
    triggerHaptic('light');
    if (onGoHome) {
      onGoHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddClick = () => {
    triggerHaptic('light');
    onOpenAddModal();
  };

  const handleBuddiesClick = () => {
    triggerHaptic('light');
    if (onGoBuddies) {
      onGoBuddies();
    } else {
      const buddiesSection = document.getElementById('buddies-list');
      if (buddiesSection) {
        buddiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
      role="navigation"
      aria-label="Mobile Navigation"
    >
      {/* 3-Column Equal Grid for Mathematically Exact Center Alignment */}
      <div className="grid grid-cols-3 items-center w-full max-w-md mx-auto pt-1.5 px-3">
        {/* Column 1: Home Button */}
        <button
          type="button"
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center gap-1 text-purple-700 hover:text-purple-900 active:scale-95 transition-transform py-1.5 focus:outline-none"
          aria-label="Scroll to Home Top"
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-bold">Home</span>
        </button>

        {/* Column 2: Exact Geometric Center Floating '+' Action */}
        <div className="flex justify-center items-center">
          <button
            type="button"
            onClick={handleAddClick}
            className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white flex items-center justify-center shadow-md hover:shadow-lg transform active:scale-90 transition-all border-2 border-white focus:outline-none"
            title="Add Birthday"
            aria-label="Add Person"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Column 3: Buddies List Scroll Button */}
        <button
          type="button"
          onClick={handleBuddiesClick}
          className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-purple-700 active:scale-95 transition-transform py-1.5 focus:outline-none"
          aria-label="Scroll to Buddies List"
        >
          <Users className="w-5 h-5 text-slate-500" />
          <span className="text-[11px] font-bold">
            {totalCount > 0 ? `${totalCount} Buddies` : 'Buddies'}
          </span>
        </button>
      </div>
    </nav>
  );
};

import React from 'react';
import { Home, Plus, Users } from 'lucide-react';

interface BottomNavProps {
  onOpenAddModal: () => void;
  totalCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenAddModal, totalCount }) => {
  return (
    <nav 
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-warm-200/80 px-6 pt-2.5 flex items-center justify-around shadow-lg"
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex flex-col items-center gap-1 text-purple-700 font-bold text-[10px]"
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      {/* Prominent floating Add CTA */}
      <button
        type="button"
        onClick={onOpenAddModal}
        className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 text-white flex items-center justify-center shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all"
        title="Add Birthday"
        aria-label="Add Birthday"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      <div className="flex flex-col items-center gap-1 text-slate-500 font-semibold text-[10px]">
        <Users className="w-5 h-5 text-slate-400" />
        <span>{totalCount} {totalCount === 1 ? 'Buddy' : 'Buddies'}</span>
      </div>
    </nav>
  );
};

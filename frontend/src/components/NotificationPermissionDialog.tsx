import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationPermissionDialogProps {
  isOpen: boolean;
  onEnable: () => void;
  onMaybeLater: () => void;
}

export const NotificationPermissionDialog: React.FC<NotificationPermissionDialogProps> = ({
  isOpen,
  onEnable,
  onMaybeLater,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-warm-200/90 dark:border-slate-800 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-soft">
          <Bell className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
            Never miss a birthday 🎂
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
            Birthday Buddy can remind you when someone's birthday is coming up.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={onEnable}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-soft active:scale-95 transition-all"
          >
            Enable Notifications
          </button>
          <button
            type="button"
            onClick={onMaybeLater}
            className="w-full py-2.5 px-4 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-xs active:scale-95 transition-all"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

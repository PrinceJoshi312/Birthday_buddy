import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

interface NotificationPermissionDialogProps {
  isOpen: boolean;
  onAllow: () => void;
  onNotNow: () => void;
}

export const NotificationPermissionDialog: React.FC<NotificationPermissionDialogProps> = ({
  isOpen,
  onAllow,
  onNotNow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-warm-200/90 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-soft">
          <Bell className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">
            Stay on top of birthdays 🎂
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
            Allow Birthday Buddy to send reminders so you never miss an important day.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={onAllow}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-soft active:scale-95 transition-all"
          >
            Allow Notifications
          </button>
          <button
            type="button"
            onClick={onNotNow}
            className="w-full py-2.5 px-4 rounded-2xl text-slate-500 hover:text-slate-700 font-bold text-xs active:scale-95 transition-all"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Clock } from 'lucide-react';
import { Person } from '../types';

interface ReminderSetupDialogProps {
  isOpen: boolean;
  person: Person | null;
  onSetReminders: () => void;
  onSkip: () => void;
}

export const ReminderSetupDialog: React.FC<ReminderSetupDialogProps> = ({
  isOpen,
  person,
  onSetReminders,
  onSkip,
}) => {
  if (!isOpen || !person) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-warm-200/90 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-soft">
          <Clock className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">
            Set up birthday reminders 🔔
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
            Would you like Birthday Buddy to remind you about <strong>{person.name}</strong>'s birthday?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={onSetReminders}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-soft active:scale-95 transition-all"
          >
            Set Reminders
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2.5 px-4 rounded-2xl text-slate-500 hover:text-slate-700 font-bold text-xs active:scale-95 transition-all"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

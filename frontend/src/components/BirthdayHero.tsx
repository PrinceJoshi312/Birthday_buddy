import React from 'react';
import { Sparkles, Calendar, Clock, ChevronRight, PartyPopper } from 'lucide-react';
import { Person } from '../types';
import { formatBirthdayDate, getZodiacSign } from '../utils/dateUtils';
import { triggerCelebration } from '../utils/celebrationService';
import { triggerHaptic } from '../utils/hapticsService';

interface BirthdayHeroProps {
  person: Person | null;
  onViewBirthday: (person: Person) => void;
  onOpenAddModal: () => void;
}

export const BirthdayHero: React.FC<BirthdayHeroProps> = ({
  person,
  onViewBirthday,
  onOpenAddModal,
}) => {
  if (!person) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-10 shadow-soft mb-8 border border-purple-800/40">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-pink-200 border border-white/15 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Welcome to Birthday Buddy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Never forget a special day.
          </h2>
          <p className="text-purple-200 text-xs sm:text-sm leading-relaxed mb-6">
            Add your friends, family, and loved ones to track countdowns, get reminders, and send thoughtful wishes.
          </p>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenAddModal();
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all transform active:scale-95"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Add Your First Birthday</span>
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = person.days_remaining ?? person.days_until ?? 0;
  const isToday = daysRemaining === 0;
  const isTomorrow = daysRemaining === 1;
  const zodiac = getZodiacSign(person.birthday);
  const firstLetter = person.name ? person.name.charAt(0).toUpperCase() : '?';

  const handleHeroAction = () => {
    if (isToday) {
      triggerCelebration();
    } else {
      triggerHaptic('light');
    }
    onViewBirthday(person);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-950 to-slate-900 text-white p-6 sm:p-8 shadow-card mb-8 border border-purple-700/40">
      {/* Subtle ambient decorative gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar, Name, Relationship & Date */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Avatar with Initial */}
          <div className="relative flex-shrink-0">
            <div className={`w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-md border border-white/20 ${
              isToday
                ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 ring-4 ring-amber-400/40'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500'
            }`}>
              {isToday ? '🎂' : firstLetter}
            </div>
            {isToday && (
              <span className="absolute -top-2 -right-2 text-xl animate-bounce">
                👑
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-white/15 backdrop-blur-md text-pink-200 border border-white/20">
                <Clock className="w-3 h-3 text-amber-300" />
                {isToday ? "Today's Birthday" : 'Next Upcoming Birthday'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-800/80 text-purple-200 border border-purple-700/50">
                {person.relationship}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{person.name}</span>
                {isToday && <span className="text-xl">🎉</span>}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-purple-200/90 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-pink-400" />
                  {formatBirthdayDate(person.birthday)}
                </span>
                {zodiac && (
                  <>
                    <span>•</span>
                    <span className="text-purple-300">{zodiac}</span>
                  </>
                )}
                {person.age_turning ? (
                  <>
                    <span>•</span>
                    <span>
                      Turning <strong className="text-amber-300 font-bold">{person.age_turning}</strong>
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            {person.notes && (
              <p className="text-xs text-purple-300/80 italic line-clamp-1 max-w-md pt-0.5">
                "{person.notes}"
              </p>
            )}
          </div>
        </div>

        {/* Right: Countdown & Single Dominant Primary Action */}
        <div className="flex flex-row sm:flex-col lg:flex-row items-center sm:items-start lg:items-center justify-between sm:justify-start gap-4 sm:gap-6 pt-4 lg:pt-0 border-t border-purple-800/50 sm:border-none">
          {/* Countdown Display */}
          <div className="text-left sm:text-right">
            {isToday ? (
              <div>
                <span className="text-xl sm:text-2xl font-black text-amber-300">
                  TODAY! 🎉
                </span>
                <p className="text-[10px] text-purple-300 uppercase tracking-widest font-bold">Party Time</p>
              </div>
            ) : isTomorrow ? (
              <div>
                <span className="text-xl sm:text-2xl font-black text-amber-300">
                  TOMORROW!
                </span>
                <p className="text-[10px] text-purple-300 uppercase tracking-widest font-bold">Get Ready 🎂</p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1 sm:justify-end">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {daysRemaining}
                  </span>
                  <span className="text-xs font-bold text-amber-300 uppercase">
                    {daysRemaining === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <p className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold">Remaining</p>
              </div>
            )}
          </div>

          {/* SINGLE CLEAR PRIMARY ACTION */}
          <div>
            <button
              type="button"
              onClick={handleHeroAction}
              className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all transform active:scale-95 ${
                isToday
                  ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:from-amber-500 hover:to-purple-700 text-white shadow-soft'
                  : 'bg-white hover:bg-purple-50 text-purple-950 shadow-sm'
              }`}
            >
              <span>{isToday ? '🎉 Celebrate & Send Wish' : 'Prepare Wish ✍️'}</span>
              <ChevronRight className={`w-4 h-4 ${isToday ? 'text-white' : 'text-purple-700'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

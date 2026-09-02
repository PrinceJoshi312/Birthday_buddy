import React from 'react';
import { Sparkles, Calendar, Clock, PartyPopper, ChevronRight, User } from 'lucide-react';
import { Person } from '../types';
import { formatBirthdayDate, getCountdownBadge, getZodiacSign } from '../utils/dateUtils';
import { triggerCelebration } from '../utils/celebrationService';

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-soft mb-8 border border-purple-800/40">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md text-pink-200 border border-white/15 mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Welcome to Birthday Buddy
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2.5">
            Keep track of every special day.
          </h2>
          <p className="text-purple-200 text-xs sm:text-sm leading-relaxed mb-6">
            Store birthdays for your friends, family, and loved ones. Never miss an important celebration again.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all transform active:scale-95"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Add Your First Birthday</span>
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = person.days_remaining ?? person.days_until ?? 0;
  const badge = getCountdownBadge(daysRemaining);
  const isToday = daysRemaining === 0;
  const isTomorrow = daysRemaining === 1;
  const zodiac = getZodiacSign(person.birthday);
  const firstLetter = person.name ? person.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-950 to-slate-900 text-white p-6 sm:p-10 shadow-soft-hover mb-8 border border-purple-700/40">
      {/* Decorative ambient gradient depth */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Avatar, Name, Relationship & Date */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
          {/* Avatar Circle with Initial & Glow */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-glow-festive border-2 border-white/30 transform hover:scale-105 transition-transform duration-200">
              {firstLetter}
            </div>
            {isToday && (
              <span className="absolute -top-2 -right-2 text-2xl animate-bounce">
                👑
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/15 backdrop-blur-md text-pink-200 border border-white/20">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> Next Upcoming Birthday
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-800/80 text-purple-200 border border-purple-700/50">
                {person.relationship}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>{person.name}</span>
                {isToday && <span className="text-2xl animate-bounce">🎉</span>}
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
                    <span>Turning <strong className="text-amber-300 font-bold">{person.age_turning}</strong></span>
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

        {/* Right: Large Countdown & "View Birthday" Button */}
        <div className="flex flex-row sm:flex-col lg:flex-row items-center sm:items-start lg:items-center justify-between sm:justify-start gap-4 sm:gap-5 pt-4 lg:pt-0 border-t border-purple-800/60 sm:border-none">
          {/* Large Countdown Display */}
          <div className="text-left sm:text-right">
            {isToday ? (
              <div>
                <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-rose-400 animate-pulse">
                  TODAY! 🎉
                </span>
                <p className="text-[11px] text-purple-300 uppercase tracking-widest font-bold">Party Time</p>
              </div>
            ) : isTomorrow ? (
              <div>
                <span className="text-2xl sm:text-3xl font-black text-amber-300">
                  TOMORROW!
                </span>
                <p className="text-[11px] text-purple-300 uppercase tracking-widest font-bold">Get Ready 🎂</p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1.5 sm:justify-end">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {daysRemaining}
                  </span>
                  <span className="text-sm font-bold text-amber-300 uppercase">
                    {daysRemaining === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <p className="text-[11px] text-purple-300 uppercase tracking-wider font-semibold">Remaining</p>
              </div>
            )}
          </div>

          {/* Action Buttons: Yellow Celebrate button + White View Birthday button */}
          <div className="flex items-center gap-2">
            {isToday && (
              <button
                type="button"
                onClick={() => triggerCelebration()}
                className="px-3.5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                title="Celebrate with confetti!"
              >
                <PartyPopper className="w-4 h-4" />
                <span className="hidden sm:inline">Celebrate!</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onViewBirthday(person)}
              className="flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <span>View Birthday</span>
              <ChevronRight className="w-4 h-4 text-purple-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

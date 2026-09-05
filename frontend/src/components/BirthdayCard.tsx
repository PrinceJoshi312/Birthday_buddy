import React from 'react';
import { Calendar, User, ChevronRight, Sparkles, Trash2, Heart, Gift } from 'lucide-react';
import { Person } from '../types';
import { formatBirthdayDate, getCountdownBadge, getZodiacSign } from '../utils/dateUtils';

interface BirthdayCardProps {
  person: Person;
  onViewBirthday: (person: Person) => void;
  onDelete?: (id: number) => void;
}

export const BirthdayCard: React.FC<BirthdayCardProps> = ({
  person,
  onViewBirthday,
  onDelete,
}) => {
  const daysRemaining = person.days_remaining ?? person.days_until ?? 0;
  const badge = getCountdownBadge(daysRemaining);
  const zodiac = getZodiacSign(person.birthday);
  const firstLetter = person.name ? person.name.charAt(0).toUpperCase() : '?';

  // Dynamic avatar gradient based on relationship
  const getAvatarGradient = (rel: string) => {
    const r = (rel || '').toLowerCase();
    if (r.includes('partner') || r.includes('love') || r.includes('spouse')) return 'from-pink-500 to-rose-500 text-white';
    if (r.includes('family') || r.includes('parent') || r.includes('sibling') || r.includes('mom') || r.includes('dad')) return 'from-amber-500 to-orange-500 text-white';
    if (r.includes('bestie') || r.includes('friend')) return 'from-purple-500 to-pink-500 text-white';
    if (r.includes('colleague') || r.includes('work')) return 'from-indigo-500 to-blue-500 text-white';
    return 'from-fuchsia-500 to-indigo-500 text-white';
  };

  const getRelationshipBadgeStyle = (rel: string) => {
    const r = (rel || '').toLowerCase();
    if (r.includes('partner')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (r.includes('family')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (r.includes('colleague')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  return (
    <div
      onClick={() => onViewBirthday(person)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-warm-200/80 dark:border-slate-800 shadow-soft hover:shadow-soft-hover transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 cursor-pointer"
    >
      <div>
        {/* Top Row: Avatar, Name & Countdown Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(person.relationship)} flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform duration-200`}>
              {firstLetter}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                {person.name}
              </h3>
              <span className={`inline-block text-[11px] px-2 py-0.5 mt-1 rounded-full font-semibold border ${getRelationshipBadgeStyle(person.relationship)}`}>
                {person.relationship}
              </span>
            </div>
          </div>

          {/* Countdown badge */}
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${badge.className}`}>
            {badge.text}
          </span>
        </div>

        {/* Middle: Birthday Date & Details */}
        <div className="bg-[#FAF8F5] dark:bg-slate-800/80 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between border border-warm-100/90 dark:border-slate-700 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatBirthdayDate(person.birthday)}</span>
            {zodiac && <span className="text-slate-400">({zodiac})</span>}
          </div>
          {person.age_turning ? (
            <div className="text-[11px]">
              <span className="text-slate-400">Turning </span>
              <span className="font-bold text-slate-800 dark:text-white">{person.age_turning}</span>
            </div>
          ) : null}
        </div>

        {/* Optional Notes snippet */}
        {person.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-purple-50/40 dark:bg-purple-950/30 px-2.5 py-2 rounded-lg border border-purple-100/50 dark:border-purple-900/40 line-clamp-1 mb-2">
            "{person.notes}"
          </p>
        )}
      </div>

      {/* Footer / Action row */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-semibold group-hover:text-purple-900 dark:group-hover:text-purple-300 transition-colors">
        <span>View Details</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

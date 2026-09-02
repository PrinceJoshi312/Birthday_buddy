export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export interface ParsedBirthday {
  birthYear: number | null;
  month: number; // 1-12
  day: number;   // 1-31
  hasYear: boolean;
}

/**
 * Parses birthday strings in YYYY-MM-DD, MM-DD, or --MM-DD formats
 */
export function parseBirthday(dateStr: string): ParsedBirthday | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim();

  // Format 1: --MM-DD (ISO recurring date)
  if (clean.startsWith('--')) {
    const parts = clean.slice(2).split('-');
    if (parts.length === 2) {
      const month = parseInt(parts[0], 10);
      const day = parseInt(parts[1], 10);
      if (!isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return { birthYear: null, month, day, hasYear: false };
      }
    }
  }

  const parts = clean.split('-');

  // Format 2: YYYY-MM-DD
  if (parts.length === 3) {
    const birthYear = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(birthYear) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { birthYear, month, day, hasYear: true };
    }
  }

  // Format 3: MM-DD
  if (parts.length === 2) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    if (!isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { birthYear: null, month, day, hasYear: false };
    }
  }

  return null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatBirthdayDate(dateStr: string, includeYear: boolean = false): string {
  const parsed = parseBirthday(dateStr);
  if (!parsed) return dateStr || '';

  const monthName = MONTH_NAMES[parsed.month - 1];
  if (includeYear && parsed.hasYear && parsed.birthYear) {
    return `${monthName} ${parsed.day}, ${parsed.birthYear}`;
  }
  return `${monthName} ${parsed.day}`;
}

export function getCountdownBadge(daysUntil?: number): {
  text: string;
  className: string;
  isUrgent: boolean;
} {
  if (daysUntil === undefined || daysUntil === null) {
    return { text: '', className: '', isUrgent: false };
  }

  if (daysUntil === 0) {
    return {
      text: 'Today! 🎉',
      className: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold animate-pulse-glow shadow-glow-festive',
      isUrgent: true,
    };
  }

  if (daysUntil === 1) {
    return {
      text: '🎁 Tomorrow',
      className: 'bg-rose-100 text-rose-700 font-bold border border-rose-200',
      isUrgent: true,
    };
  }

  if (daysUntil <= 3) {
    return {
      text: `⏰ In ${daysUntil} days`,
      className: 'bg-amber-100 text-amber-900 font-bold border border-amber-300',
      isUrgent: true,
    };
  }

  if (daysUntil <= 7) {
    return {
      text: `📅 In ${daysUntil} days`,
      className: 'bg-purple-100 text-purple-800 font-semibold border border-purple-200',
      isUrgent: true,
    };
  }

  if (daysUntil <= 30) {
    return {
      text: `In ${daysUntil} days`,
      className: 'bg-purple-50 text-purple-700 font-medium border border-purple-200/80',
      isUrgent: false,
    };
  }

  return {
    text: `In ${daysUntil} days`,
    className: 'bg-slate-100 text-slate-600 font-medium border border-slate-200',
    isUrgent: false,
  };
}

export function getZodiacSign(dateStr: string): string {
  const parsed = parseBirthday(dateStr);
  if (!parsed) return '';

  const { month, day } = parsed;

  const zodiac = [
    { sign: '♑ Capricorn', m: 1, d: 19 },
    { sign: '♒ Aquarius', m: 2, d: 18 },
    { sign: '♓ Pisces', m: 3, d: 20 },
    { sign: '♈ Aries', m: 4, d: 19 },
    { sign: '♉ Taurus', m: 5, d: 20 },
    { sign: '♊ Gemini', m: 6, d: 20 },
    { sign: '♋ Cancer', m: 7, d: 22 },
    { sign: '♌ Leo', m: 8, d: 22 },
    { sign: '♍ Virgo', m: 9, d: 22 },
    { sign: '♎ Libra', m: 10, d: 22 },
    { sign: '♏ Scorpio', m: 11, d: 21 },
    { sign: '♐ Sagittarius', m: 12, d: 21 },
    { sign: '♑ Capricorn', m: 12, d: 31 },
  ];

  for (const z of zodiac) {
    if (month === z.m && day <= z.d) return z.sign;
  }
  return '♑ Capricorn';
}

/**
 * Calculates next upcoming birthday, days remaining, turning age, and leap-year edge cases.
 * Handles both full dates (YYYY-MM-DD) and yearless birthdays (MM-DD).
 */
export function calculateBirthdayDetails(dateStr: string, referenceDate: Date = new Date()): {
  days_until: number;
  days_remaining: number;
  age_turning?: number;
  has_year: boolean;
  is_today: boolean;
  next_birthday: string;
} {
  const parsed = parseBirthday(dateStr);
  if (!parsed) {
    return { days_until: 999, days_remaining: 999, has_year: false, is_today: false, next_birthday: '' };
  }

  const { birthYear, month, day, hasYear } = parsed;

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  // Handle Feb 29 in non-leap years (celebrate on Feb 28)
  const getAnniversaryDate = (year: number) => {
    let d = day;
    if (month === 2 && day === 29 && !isLeapYear(year)) {
      d = 28;
    }
    return new Date(year, month - 1, d);
  };

  let nextBirthdayDate = getAnniversaryDate(currentYear);
  if (nextBirthdayDate < today) {
    nextBirthdayDate = getAnniversaryDate(currentYear + 1);
  }

  const diffTime = nextBirthdayDate.getTime() - today.getTime();
  const days_remaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate turning age ONLY if birth year is known
  let age_turning: number | undefined = undefined;
  if (hasYear && birthYear !== null) {
    age_turning = nextBirthdayDate.getFullYear() - birthYear;
  }

  const y = nextBirthdayDate.getFullYear();
  const mStr = String(nextBirthdayDate.getMonth() + 1).padStart(2, '0');
  const dStr = String(nextBirthdayDate.getDate()).padStart(2, '0');
  const next_birthday = `${y}-${mStr}-${dStr}`;

  return {
    days_until: days_remaining,
    days_remaining,
    age_turning,
    has_year: hasYear,
    is_today: days_remaining === 0,
    next_birthday,
  };
}

import React, { useState } from 'react';
import { X, User, Calendar, MessageSquare, AlertCircle, Sparkles, Check, ArrowLeft, Loader2, Bell, Clock } from 'lucide-react';
import { PersonInput, RelationshipType } from '../types';
import { fireBirthdayConfetti } from '../utils/confetti';
import { parseBirthday } from '../utils/dateUtils';
import { triggerHaptic } from '../utils/hapticsService';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonInput) => Promise<void>;
}

const RELATIONSHIPS: { label: RelationshipType; emoji: string; desc: string }[] = [
  { label: 'Friend', emoji: '🎈', desc: 'Good friend' },
  { label: 'Best Friend', emoji: '✨', desc: 'Ride or die' },
  { label: 'Family', emoji: '🏡', desc: 'Kin & relatives' },
  { label: 'Partner', emoji: '💖', desc: 'Significant other' },
  { label: 'Colleague', emoji: '💼', desc: 'Work buddy' },
  { label: 'Other', emoji: '🌟', desc: 'Someone special' },
];

const REMINDER_OPTIONS = [
  { id: 'on_day', label: 'On Birthday', emoji: '🎂' },
  { id: '1_day_before', label: '1 Day Before', emoji: '🎁' },
  { id: '3_days_before', label: '3 Days Before', emoji: '⏰' },
  { id: '7_days_before', label: '7 Days Before', emoji: '📅' },
];

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const getDaysInMonth = (m: number) => {
  if ([4, 6, 9, 11].includes(m)) return 30;
  if (m === 2) return 29;
  return 31;
};

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [knowsYear, setKnowsYear] = useState(true);
  const [fullDate, setFullDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [relationship, setRelationship] = useState<RelationshipType>('Friend');
  const [notes, setNotes] = useState('');
  const [selectedReminders, setSelectedReminders] = useState<string[]>(['on_day', '1_day_before']);
  const [reminderTime, setReminderTime] = useState('09:00');

  // Inline Validation State
  const [touched, setTouched] = useState<{ name?: boolean; birthday?: boolean }>({});
  const [errors, setErrors] = useState<{ name?: string; birthday?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  if (!isOpen) return null;

  const getComputedBirthday = (): string => {
    if (knowsYear) {
      return fullDate;
    }
    const mStr = String(selectedMonth).padStart(2, '0');
    const dStr = String(selectedDay).padStart(2, '0');
    return `${mStr}-${dStr}`;
  };

  const validate = (fieldValues = { name, birthday: getComputedBirthday() }) => {
    const tempErrors: { name?: string; birthday?: string } = {};

    if ('name' in fieldValues) {
      if (!fieldValues.name.trim()) {
        tempErrors.name = 'Please enter a name.';
      } else if (fieldValues.name.trim().length < 2) {
        tempErrors.name = 'Name must be at least 2 characters.';
      }
    }

    if ('birthday' in fieldValues) {
      if (!fieldValues.birthday) {
        tempErrors.birthday = 'Please select a birthday date.';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (touched.name) validate({ name: val, birthday: getComputedBirthday() });
  };

  const handleFullDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullDate(val);
    if (val) {
      const parsed = parseBirthday(val);
      if (parsed) {
        setSelectedMonth(parsed.month);
        setSelectedDay(parsed.day);
      }
    }
    if (touched.birthday) validate({ name, birthday: val });
  };

  const handleToggleKnowsYear = () => {
    const nextKnows = !knowsYear;
    setKnowsYear(nextKnows);
    if (nextKnows) {
      if (!fullDate && selectedMonth && selectedDay) {
        const mStr = String(selectedMonth).padStart(2, '0');
        const dStr = String(selectedDay).padStart(2, '0');
        setFullDate(`2000-${mStr}-${dStr}`);
      }
    }
  };

  const handleBlur = (field: 'name' | 'birthday') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const toggleReminder = (id: string) => {
    setSelectedReminders((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id);
        return next.length > 0 ? next : ['on_day'];
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, birthday: true });

    const birthdayToSave = getComputedBirthday();
    if (!validate({ name, birthday: birthdayToSave })) {
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError('');

      await onSubmit({
        name: name.trim(),
        birthday: birthdayToSave,
        relationship,
        notes: notes.trim(),
        reminder_days: selectedReminders.join(','),
        reminder_time: reminderTime || '09:00',
      });

      // Celebration burst on save
      fireBirthdayConfetti();
      triggerHaptic('success');

      // Reset form state
      setName('');
      setFullDate('');
      setKnowsYear(true);
      setRelationship('Friend');
      setNotes('');
      setSelectedReminders(['on_day', '1_day_before']);
      setReminderTime('09:00');
      setTouched({});
      setErrors({});

      onClose();
    } catch (err: any) {
      setApiError(err.message || 'Failed to save birthday. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const maxDays = getDaysInMonth(selectedMonth);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-opacity">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-warm-200/90 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-5 sm:px-8 pt-5 pb-5 bg-gradient-to-r from-purple-100/80 via-pink-100/70 to-amber-100/80 border-b border-warm-200/80">
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-purple-700 border border-warm-200/80 text-xs font-extrabold shadow-xs active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-purple-600" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shadow-xs active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-600 text-white shadow-sm">
                <Sparkles className="w-3 h-3" /> New Person
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1">
              Add a Birthday 🎂
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              We'll calculate countdowns and remind you so you never forget!
            </p>
          </div>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mx-6 sm:mx-8 mt-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-6">
          {/* Row 1: Name and Birthday Date / Month & Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Name Input */}
            <div>
              <label htmlFor="person-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="person-name"
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => handleBlur('name')}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium transition-all bg-warm-50/70 border ${
                    touched.name && errors.name
                      ? 'border-rose-300 ring-2 ring-rose-200/50 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                      : 'border-warm-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  } focus:outline-none shadow-sm`}
                />
              </div>
              {touched.name && errors.name && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Birthday Date Picker or Month/Day Selects */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Birthday <span className="text-rose-500">*</span>
                </label>
              </div>

              {knowsYear ? (
                <div className="relative">
                  <input
                    id="person-birthday"
                    type="date"
                    required
                    max={todayStr}
                    value={fullDate}
                    onChange={handleFullDateChange}
                    onBlur={() => handleBlur('birthday')}
                    className={`w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all bg-warm-50/70 border ${
                      touched.birthday && errors.birthday
                        ? 'border-rose-300 ring-2 ring-rose-200/50 bg-rose-50/30 text-rose-900 focus:ring-rose-400'
                        : 'border-warm-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    } focus:outline-none shadow-sm`}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-3 rounded-2xl text-sm font-medium bg-warm-50/70 border border-warm-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDay > maxDays ? maxDays : selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-3 rounded-2xl text-sm font-medium bg-warm-50/70 border border-warm-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                  >
                    {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Toggle Year Unknown */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleToggleKnowsYear}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 transition-colors"
                >
                  <span className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${!knowsYear ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-warm-300'}`}>
                    {!knowsYear && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span>I don't know the birth year (month & day only)</span>
                </button>
              </div>

              {touched.birthday && errors.birthday && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.birthday}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Relationship Selector Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Relationship
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {RELATIONSHIPS.map((rel) => {
                const isSelected = relationship === rel.label;
                return (
                  <button
                    type="button"
                    key={rel.label}
                    onClick={() => setRelationship(rel.label)}
                    className={`p-3 rounded-2xl text-left border transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-400/40 shadow-sm scale-[1.02]'
                        : 'border-warm-200/90 bg-warm-50/60 hover:bg-warm-100/70 text-slate-700 hover:border-warm-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{rel.emoji}</span>
                      <span className="text-xs font-bold">{rel.label}</span>
                    </div>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Reminder Preferences (Chips + Timing) */}
          <div className="bg-warm-50/80 p-4 sm:p-5 rounded-2xl border border-warm-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-purple-600" />
                <span>Reminder Triggers</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Select one or more</span>
            </div>

            {/* Reminder Options Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {REMINDER_OPTIONS.map((opt) => {
                const isChecked = selectedReminders.includes(opt.id);
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => toggleReminder(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs font-bold ${
                      isChecked
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-slate-700 border-warm-200 hover:bg-warm-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{opt.emoji}</span>
                      <span className="leading-tight">{opt.label}</span>
                    </div>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Preferred Reminder Time */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferred Reminder Time:</span>
              </span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-3 py-1.5 bg-white border border-warm-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>
          </div>

          {/* Row 4: Optional Notes Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="person-notes" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>Notes & Gift Ideas <span className="text-slate-400 font-normal lowercase">(optional)</span></span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">{notes.length}/200</span>
            </div>
            <textarea
              id="person-notes"
              rows={2}
              maxLength={200}
              placeholder="e.g. Loves matcha lattes, allergic to peanuts, wants a vintage camera..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium bg-warm-50/70 border border-warm-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none shadow-sm"
            />
          </div>

          {/* Row 5: Action Footer (Cancel / Save) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100/80 hover:text-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs sm:text-sm shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Birthday...</span>
                </>
              ) : (
                <span>Save Person 🎂</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

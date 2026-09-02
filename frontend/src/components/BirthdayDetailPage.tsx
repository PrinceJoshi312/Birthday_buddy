import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Clock, Sparkles, Copy, Check, RefreshCw, 
  Trash2, PartyPopper, MessageSquare, Quote, Share2, 
  Send, Edit3, AlertTriangle
} from 'lucide-react';
import { Person, PersonInput } from '../types';
import { formatBirthdayDate, getCountdownBadge, getZodiacSign, calculateBirthdayDetails } from '../utils/dateUtils';
import { fireBirthdayConfetti } from '../utils/confetti';
import { getRandomMessage, MessageStyle, MESSAGE_STYLES } from '../utils/messageTemplates';
import { triggerCelebration } from '../utils/celebrationService';
import { EditPersonModal } from './EditPersonModal';
import { pushNav, popNav, AppNavState } from '../utils/navigation';

// Brand SVGs for Pixel-Perfect Social Media Handoffs
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.97.53 1.77.82 2.8.82 3.182 0 5.769-2.587 5.769-5.766.001-3.182-2.585-5.806-5.773-5.806zm0 10.373c-.88 0-1.603-.244-2.316-.667l-.165-.098-1.576.413.421-1.536-.107-.171c-.464-.739-.709-1.464-.708-2.314.001-2.525 2.055-4.579 4.451-4.579 2.395 0 4.449 2.054 4.45 4.58-.001 2.526-2.056 4.372-4.45 4.372z"/>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l5.006-1.312C8.447 21.498 10.174 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.273c-1.637 0-3.15-.494-4.417-1.341l-.317-.214-2.966.778.792-2.892-.236-.375C3.963 14.908 3.455 13.493 3.455 12c0-4.712 3.833-8.545 8.545-8.545 4.713 0 8.545 3.833 8.545 8.545 0 4.713-3.832 8.273-8.545 8.273z"/>
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SnapchatIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.001 2.5c-3.528 0-5.833 2.508-5.833 5.485 0 .977.29 2.052.748 2.766.126.195.074.45-.116.583-.497.35-.99.553-1.455.597-.37.035-.558.461-.284.72.767.724 1.77 1.054 2.585 1.135.132.013.235.107.262.237.135.65.65 1.572 1.957 1.83.218.043.376.223.385.445.027.69-.326 1.258-1.583 1.728-.507.19-.884.674-.632 1.207.242.511.968.767 2.012.767.893 0 1.63-.16 2.074-.473.18-.127.42-.116.587.026.495.42 1.136.647 1.903.647.765 0 1.406-.227 1.9-.647.167-.142.408-.153.588-.026.444.313 1.18.473 2.074.473 1.044 0 1.77-.256 2.012-.767.252-.533-.125-1.017-.632-1.207-1.257-.47-1.61-1.038-1.583-1.728.009-.222.167-.402.385-.445 1.307-.258 1.822-1.18 1.957-1.83.027-.13.13-.224.262-.237.815-.081 1.818-.411 2.585-1.135.274-.259.086-.685-.284-.72-.465-.044-.958-.247-1.455-.597-.19-.133-.242-.388-.116-.583.458-.714.748-1.789.748-2.766 0-2.977-2.305-5.485-5.833-5.485z"/>
  </svg>
);

interface BirthdayDetailPageProps {
  person: Person;
  onBack: () => void;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, data: Partial<PersonInput>) => Promise<Person>;
}

export const BirthdayDetailPage: React.FC<BirthdayDetailPageProps> = ({
  person: initialPerson,
  onBack,
  onDelete,
  onUpdate,
}) => {
  const [currentPerson, setCurrentPerson] = useState<Person>(initialPerson);
  const [selectedStyle, setSelectedStyle] = useState<MessageStyle>('Simple');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Synchronize when initialPerson changes from parent
  useEffect(() => {
    setCurrentPerson(initialPerson);
  }, [initialPerson]);

  // Listen for history popstate to dismiss edit/delete sub-modals
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as AppNavState | null;
      if (!state) return;
      if (state.view !== 'edit') {
        setIsEditModalOpen(false);
      }
      if (state.view !== 'delete') {
        setIsDeleteDialogOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Recalculate countdown details dynamically based on currentPerson
  const { days_until, age_turning, is_today } = calculateBirthdayDetails(currentPerson.birthday);
  const daysRemaining = currentPerson.days_remaining ?? days_until;
  const isToday = daysRemaining === 0 || is_today;
  const isTomorrow = daysRemaining === 1;
  const badge = getCountdownBadge(daysRemaining);
  const zodiac = getZodiacSign(currentPerson.birthday);
  const firstLetter = currentPerson.name ? currentPerson.name.charAt(0).toUpperCase() : '?';

  const showToast = (msg: string) => {
    setToastFeedback(msg);
    setTimeout(() => setToastFeedback(null), 3500);
  };

  // Generate initial wish on mount or style change
  useEffect(() => {
    const msg = getRandomMessage(selectedStyle, currentPerson.name);
    setGeneratedMessage(msg);
  }, [selectedStyle, currentPerson.name]);

  const handleSelectStyle = (style: MessageStyle) => {
    setSelectedStyle(style);
    const msg = getRandomMessage(style, currentPerson.name);
    setGeneratedMessage(msg);
  };

  const handleRegenerate = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 400);
    const msg = getRandomMessage(selectedStyle, currentPerson.name, generatedMessage);
    setGeneratedMessage(msg);
  };

  // Helper to copy text to clipboard without breaking popup/sync event context
  const copyWishToClipboard = (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignore copy error
    }
  };

  // 1. WhatsApp Action
  const handleSendWhatsApp = () => {
    const msg = generatedMessage.trim();
    if (!msg) return;
    const encoded = encodeURIComponent(msg);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. Instagram Action (Copies wish synchronously & opens Instagram Direct Inbox)
  const handleSendInstagram = () => {
    const msg = generatedMessage.trim();
    if (!msg) return;
    copyWishToClipboard(msg);
    showToast('Wish copied to clipboard! Paste it into Instagram DM 📸');
    window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
  };

  // 3. Facebook / Messenger Action (Copies wish & opens Facebook Share)
  const handleSendFacebook = () => {
    const msg = generatedMessage.trim();
    if (!msg) return;
    copyWishToClipboard(msg);
    showToast('Wish copied! Opening Facebook... 🔵');
    const encoded = encodeURIComponent(msg);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  // 4. Snapchat Action (Copies wish & opens Snapchat Share)
  const handleSendSnapchat = () => {
    const msg = generatedMessage.trim();
    if (!msg) return;
    copyWishToClipboard(msg);
    showToast('Wish copied! Opening Snapchat... 👻');
    const encoded = encodeURIComponent(msg);
    window.open(`https://www.snapchat.com/share?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  // 5. Copy Action
  const handleCopy = async () => {
    const msg = generatedMessage.trim();
    if (!msg) return;
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      showToast('Copied to clipboard! 📋🎉');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Failed to copy to clipboard.');
    }
  };

  // 6. Web Share API Action (Mobile Native Sheet)
  const handleShare = async () => {
    const msg = generatedMessage.trim();
    if (!msg) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Happy Birthday ${currentPerson.name}!`,
          text: msg,
        });
        showToast('Shared successfully! 📤');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  // 7. SMS Handoff Action
  const handleSendSMS = () => {
    const msg = generatedMessage.trim();
    if (!msg) return;
    const encoded = encodeURIComponent(msg);
    window.location.href = `sms:?body=${encoded}`;
  };

  // 8. Celebration Action (Explicit user tap on Celebrate button)
  const handleCelebrate = () => {
    triggerCelebration();
    showToast(`Happy Birthday ${currentPerson.name}! 🥳🎉`);
  };

  // Open Edit Modal with History
  const handleOpenEdit = () => {
    pushNav('edit', currentPerson.id);
    setIsEditModalOpen(true);
  };

  // Close Edit Modal with History Sync
  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    popNav();
  };

  // Save Edit Handler
  const handleSaveEdit = async (id: number, data: Partial<PersonInput>) => {
    const updated = await onUpdate(id, data);
    setCurrentPerson(updated);
    setIsEditModalOpen(false);
    popNav();
    showToast(`Updated details for ${updated.name}! ✨`);
  };

  // Open Delete Dialog with History
  const handleOpenDelete = () => {
    pushNav('delete', currentPerson.id);
    setIsDeleteDialogOpen(true);
  };

  // Close Delete Dialog with History Sync
  const handleCloseDelete = () => {
    setIsDeleteDialogOpen(false);
    popNav();
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(currentPerson.id);
      setIsDeleteDialogOpen(false);
      onBack(); // Return to dashboard
    } catch {
      showToast('Failed to remove person.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Toast Notification */}
      {toastFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-2xl border border-slate-700">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{toastFeedback}</span>
          </div>
        </div>
      )}

      {/* STICKY TOP NAVIGATION / ACTION BAR */}
      <div className="sticky top-14 sm:top-16 z-20 w-full py-2.5 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-warm-200/70 flex items-center justify-between gap-3 shadow-xs transition-all mb-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-warm-100 text-slate-700 hover:text-slate-900 border border-warm-200/90 text-xs sm:text-sm font-extrabold shadow-sm transition-all active:scale-95 group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Birthdays</span>
        </button>

        {/* Action icons: Edit & Delete */}
        <div className="flex items-center gap-2">
          {/* Edit Action Button */}
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-warm-200/90 hover:border-purple-200 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Edit Person"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Edit</span>
          </button>

          {/* Delete Action Button */}
          <button
            type="button"
            onClick={handleOpenDelete}
            className="w-9 h-9 rounded-2xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-warm-200/90 hover:border-rose-200 flex items-center justify-center transition-colors shadow-sm active:scale-95"
            title="Delete Person"
            aria-label="Delete Person"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HERO / PERSON HEADER CARD */}
      <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-6 sm:p-8 shadow-card ${
        isToday 
          ? 'bg-gradient-to-r from-amber-500/20 via-pink-500/15 to-purple-600/20 border-amber-300 shadow-glow-festive' 
          : 'bg-white border-warm-200/90'
      }`}>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar Badge */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-soft flex-shrink-0 ${
              isToday
                ? 'bg-gradient-to-tr from-amber-500 via-pink-500 to-rose-500 ring-4 ring-amber-300/60 animate-bounce-subtle'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500'
            }`}>
              {isToday ? '🎂' : firstLetter}
            </div>

            {/* Name & Basic Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {currentPerson.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {currentPerson.relationship}
                </span>
                {zodiac && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {zodiac}
                  </span>
                )}
              </div>

              {/* Date & Turning Age */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>{formatBirthdayDate(currentPerson.birthday)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  {isToday ? (
                    <span className="text-purple-700">
                      {age_turning ? `🎂 Turning ${age_turning} today!` : `🎂 Birthday is today!`}
                    </span>
                  ) : isTomorrow ? (
                    <span className="text-rose-600">
                      {age_turning ? `🎁 Turning ${age_turning} tomorrow!` : `🎁 Birthday is tomorrow!`}
                    </span>
                  ) : (
                    <span>
                      {age_turning ? `Turning ${age_turning} in ${daysRemaining} days` : `In ${daysRemaining} days`}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right Badge & Celebrate Button */}
          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm ${badge.className}`}>
              {badge.text}
            </span>

            {/* CELEBRATE BUTTON - Shown ONLY on Today's Birthday */}
            {isToday && (
              <button
                type="button"
                onClick={handleCelebrate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all duration-200 animate-pulse-glow"
                title="Celebrate Birthday!"
              >
                <PartyPopper className="w-4 h-4 animate-bounce" />
                <span>🎉 Celebrate!</span>
              </button>
            )}
          </div>
        </div>

        {/* Notes & Reminder preferences box */}
        {(currentPerson.notes || currentPerson.reminder_days) && (
          <div className="mt-5 pt-5 border-t border-warm-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {currentPerson.notes && (
              <div className="bg-warm-50/70 p-3 rounded-2xl border border-warm-200/70">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                  💡 Notes & Ideas:
                </span>
                <p className="text-slate-600 italic">"{currentPerson.notes}"</p>
              </div>
            )}
            {currentPerson.reminder_days && (
              <div className="bg-warm-50/70 p-3 rounded-2xl border border-warm-200/70">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                  🔔 Active Reminders:
                </span>
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span className="capitalize">
                    {currentPerson.reminder_days.replace(/_/g, ' ').replace(/,/g, ', ')} (at {currentPerson.reminder_time || '09:00'})
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WISH PREPARATION STUDIO */}
      <section className="bg-white rounded-3xl border border-warm-200/90 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-600 mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>Wish Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Prepare a Birthday Message ✍️
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pick a suggestion or write your own custom message for {currentPerson.name}
            </p>
          </div>

          {/* Shuffle / Regenerate Button */}
          <button
            type="button"
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-warm-100 hover:bg-warm-200 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-sm transition-all active:scale-95"
            title="Try another variation"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isRotating ? 'animate-spin' : ''}`} />
            <span>Shuffle Idea</span>
          </button>
        </div>

        {/* Style Selector Chips */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
            Choose Tone:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {MESSAGE_STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => handleSelectStyle(style.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-soft scale-[1.02]'
                      : 'bg-warm-50/60 hover:bg-warm-100 text-slate-700 border-warm-200/90'
                  }`}
                >
                  <span className="text-lg">{style.emoji}</span>
                  <div>
                    <div className="text-xs font-extrabold">{style.label}</div>
                    <div className={`text-[10px] leading-tight ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                      {style.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Editable Message Textarea Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="custom-birthday-message" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Personalize Message (Editable)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {generatedMessage.length} characters
            </span>
          </div>

          <div className="relative">
            <textarea
              id="custom-birthday-message"
              rows={4}
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              placeholder="Write your custom birthday wish here..."
              className="w-full p-4 sm:p-5 rounded-2xl bg-warm-50/90 border border-warm-200 text-slate-800 text-sm sm:text-base font-medium leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-y min-h-[110px]"
            />
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 italic">
            <span>✏️ You can type directly in the box above to customize the wish before tapping any send button!</span>
          </p>
        </div>

        {/* 1-TAP SOCIAL & MESSAGING HANDOFFS */}
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Send Wish With 1-Tap 🚀
            </label>

            {/* 4 Major Social Networks: WhatsApp, Instagram, Facebook, Snapchat */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-xs sm:text-sm shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all"
                title="Send via WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              {/* Instagram Button */}
              <button
                type="button"
                onClick={handleSendInstagram}
                className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all"
                title="Send via Instagram Direct"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Instagram</span>
              </button>

              {/* Facebook / Messenger Button */}
              <button
                type="button"
                onClick={handleSendFacebook}
                className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-xs sm:text-sm shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all"
                title="Send via Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>Facebook</span>
              </button>

              {/* Snapchat Button */}
              <button
                type="button"
                onClick={handleSendSnapchat}
                className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-2xl bg-[#FFFC00] hover:bg-[#F2EE00] text-slate-950 font-black text-xs sm:text-sm shadow-soft hover:shadow-soft-hover transform active:scale-95 transition-all border border-amber-300/80"
                title="Send via Snapchat"
              >
                <SnapchatIcon className="w-4 h-4" />
                <span>Snapchat</span>
              </button>
            </div>
          </div>

          {/* SECONDARY UTILITIES ROW (Copy, Share, SMS) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm border transition-all active:scale-95 shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-warm-50 text-slate-800 border-warm-300'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Copied! 🎉</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-purple-600" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            {/* Web Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm bg-white hover:bg-warm-50 text-slate-800 border border-warm-300 transition-all active:scale-95 shadow-sm"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Share...</span>
            </button>

            {/* SMS Button */}
            <button
              type="button"
              onClick={handleSendSMS}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm bg-white hover:bg-warm-50 text-slate-800 border border-warm-300 transition-all active:scale-95 shadow-sm"
            >
              <Send className="w-4 h-4 text-amber-600" />
              <span>Send via SMS 💬</span>
            </button>
          </div>
        </div>
      </section>

      {/* BOTTOM RETURN ACTION */}
      <div className="pt-2 pb-6 flex items-center justify-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-warm-100 text-slate-700 hover:text-slate-900 border border-warm-200/90 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to All Birthdays</span>
        </button>
      </div>

      {/* Edit Person Modal */}
      <EditPersonModal
        person={currentPerson}
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />

      {/* Lightweight Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-warm-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Remove {currentPerson.name}?
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  This will delete {currentPerson.name} and their birthday reminders.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95"
              >
                {isDeleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

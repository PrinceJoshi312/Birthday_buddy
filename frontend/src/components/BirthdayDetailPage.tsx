import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  PartyPopper, 
  Sparkles, 
  MessageSquare, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { Person, PersonInput } from '../types';
import { formatBirthdayDate, getCountdownBadge, getZodiacSign } from '../utils/dateUtils';
import { getRandomMessage, MessageStyle, MESSAGE_STYLES } from '../utils/messageTemplates';
import { triggerCelebration } from '../utils/celebrationService';
import { triggerHaptic } from '../utils/hapticsService';
import { EditPersonModal } from './EditPersonModal';
import { pushNav, popNav } from '../utils/navigation';

interface BirthdayDetailPageProps {
  person: Person;
  onBack: () => void;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, data: Partial<PersonInput>) => Promise<Person>;
}

// Pixel-perfect Brand Icons
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SnapchatIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.004 0c-4.148 0-6.996 2.946-6.996 6.368 0 .809.176 1.621.494 2.367l.115.263-.443.088c-.689.136-1.15.422-1.37.85-.205.4-.176.89.083 1.377.291.545.86 1.043 1.644 1.442l.33.167-.184.322c-.413.722-.843 1.34-1.328 1.905l-.544.633.791.267c.725.244 1.36.567 1.892.96.14.103.264.214.372.331l.244.266-.328.143c-.76.331-1.393.754-1.884 1.258-.456.467-.714.97-.768 1.493-.058.552.128 1.065.553 1.526.471.511 1.189.845 2.133.992l.504.079-.196.469c-.482 1.153-.615 2.052-.416 2.83.218.852.836 1.44 1.839 1.748 1.025.315 2.378.435 4.02.358l.492-.023.493.023c1.642.077 2.995-.043 4.02-.358 1.003-.308 1.621-.896 1.839-1.748.199-.778.066-1.677-.416-2.83l-.196-.469.504-.079c.944-.147 1.662-.481 2.133-.992.425-.461.611-.974.553-1.526-.054-.523-.312-1.026-.768-1.493-.491-.504-1.124-.927-1.884-1.258l-.328-.143.244-.266c.108-.117.232-.228.372-.331.532-.393 1.167-.716 1.892-.96l.791-.267-.544-.633c-.485-.565-.915-1.183-1.328-1.905l-.184-.322.33-.167c.784-.399 1.353-.897 1.644-1.442.259-.487.288-.977.083-1.377-.22-.428-.681-.714-1.37-.85l-.443-.088.115-.263c.318-.746.494-1.558.494-2.367C19 2.946 16.152 0 12.004 0z"/>
  </svg>
);

export const BirthdayDetailPage: React.FC<BirthdayDetailPageProps> = ({
  person,
  onBack,
  onDelete,
  onUpdate,
}) => {
  const [currentPerson, setCurrentPerson] = useState<Person>(person);
  const [selectedStyle, setSelectedStyle] = useState<MessageStyle>('Simple');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  // Sync state if prop changes
  useEffect(() => {
    setCurrentPerson(person);
  }, [person]);

  // Generate initial wish message on person/style load
  useEffect(() => {
    const msg = getRandomMessage(selectedStyle, currentPerson.name);
    setGeneratedMessage(msg);
  }, [currentPerson.name, selectedStyle]);

  // Derived date calculation metrics
  const daysRemaining = currentPerson.days_remaining ?? currentPerson.days_until ?? 0;
  const isToday = daysRemaining === 0;
  const isTomorrow = daysRemaining === 1;
  const badge = getCountdownBadge(daysRemaining);
  const zodiac = getZodiacSign(currentPerson.birthday);
  const age_turning = currentPerson.age_turning;
  const firstLetter = currentPerson.name ? currentPerson.name.charAt(0).toUpperCase() : '?';

  // Toast Helper
  const showToast = (msg: string) => {
    setToastFeedback(msg);
    setTimeout(() => setToastFeedback(null), 3000);
  };

  // Tone Selection Handler
  const handleSelectStyle = (style: MessageStyle) => {
    triggerHaptic('light');
    setSelectedStyle(style);
    const msg = getRandomMessage(style, currentPerson.name);
    setGeneratedMessage(msg);
  };

  // Regenerate / Shuffle Handler
  const handleRegenerate = () => {
    triggerHaptic('light');
    setIsRotating(true);
    const msg = getRandomMessage(selectedStyle, currentPerson.name, generatedMessage);
    setGeneratedMessage(msg);
    setTimeout(() => setIsRotating(false), 300);
  };

  // Safe Universal Clipboard Copy Helper
  const copyWishToClipboard = (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // Ignore
    }
  };

  // 1. WhatsApp Action
  const handleSendWhatsApp = () => {
    triggerHaptic('light');
    const msg = generatedMessage.trim();
    if (!msg) return;
    const encoded = encodeURIComponent(msg);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. Instagram Action (Copies wish & opens Instagram Direct Inbox)
  const handleSendInstagram = () => {
    triggerHaptic('light');
    const msg = generatedMessage.trim();
    if (!msg) return;
    copyWishToClipboard(msg);
    showToast('Wish copied! Paste into Instagram DM 📸');
    window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
  };

  // 3. Facebook / Messenger Action
  const handleSendFacebook = () => {
    triggerHaptic('light');
    const msg = generatedMessage.trim();
    if (!msg) return;
    copyWishToClipboard(msg);
    showToast('Wish copied! Opening Facebook... 🔵');
    const encoded = encodeURIComponent(msg);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  // 4. Snapchat Action
  const handleSendSnapchat = () => {
    triggerHaptic('light');
    const msg = generatedMessage.trim();
    if (!msg) return;
    copyWishToClipboard(msg);
    showToast('Wish copied! Opening Snapchat... 👻');
    const encoded = encodeURIComponent(msg);
    window.open(`https://www.snapchat.com/share?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  // 5. Copy Action
  const handleCopy = async () => {
    triggerHaptic('medium');
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
    triggerHaptic('light');
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
    triggerHaptic('light');
    const msg = generatedMessage.trim();
    if (!msg) return;
    const encoded = encodeURIComponent(msg);
    window.location.href = `sms:?body=${encoded}`;
  };

  // 8. Celebration Action
  const handleCelebrate = () => {
    triggerCelebration();
    showToast(`Happy Birthday ${currentPerson.name}! 🥳🎉`);
    const studio = document.getElementById('wish-studio');
    if (studio) {
      studio.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Open Edit Modal with History
  const handleOpenEdit = () => {
    triggerHaptic('light');
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
    triggerHaptic('success');
    const updated = await onUpdate(id, data);
    setCurrentPerson(updated);
    setIsEditModalOpen(false);
    popNav();
    showToast(`Updated details for ${updated.name}! ✨`);
  };

  // Open Delete Dialog with History
  const handleOpenDelete = () => {
    triggerHaptic('medium');
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
    triggerHaptic('medium');
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
      {/* Toast Feedback */}
      {toastFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-2xl border border-slate-700">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{toastFeedback}</span>
          </div>
        </div>
      )}

      {/* CLEAR, HIGH-CONTRAST TOP APP BAR / BACK NAVIGATION */}
      <div className="sticky top-14 sm:top-16 z-20 w-full py-2.5 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between gap-3 shadow-xs transition-all mb-2">
        {/* Android-style clean, distinct Back Navigation */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onBack();
          }}
          className="inline-flex items-center gap-2.5 py-1 px-1 -ml-1 text-slate-800 hover:text-purple-700 font-bold text-sm sm:text-base group active:scale-95 transition-all focus:outline-none"
          aria-label="Back to Birthdays"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-700 group-hover:bg-purple-50 group-hover:text-purple-700 group-hover:border-purple-200 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-700 group-hover:text-purple-700 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="tracking-tight font-extrabold">Back to Birthdays</span>
        </button>

        {/* Action icons: Edit & Delete */}
        <div className="flex items-center gap-2">
          {/* Edit Action Button */}
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/90 hover:border-purple-200 text-xs font-bold transition-all shadow-xs active:scale-95"
            title="Edit Person"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Edit</span>
          </button>

          {/* Delete Action Button */}
          <button
            type="button"
            onClick={handleOpenDelete}
            className="w-8 h-8 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/90 hover:border-rose-200 flex items-center justify-center transition-colors shadow-xs active:scale-95"
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
          ? 'bg-gradient-to-r from-amber-500/15 via-pink-500/10 to-purple-600/15 border-amber-300/80 shadow-glow-festive' 
          : 'bg-white border-warm-200/90'
      }`}>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar Badge */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-sm flex-shrink-0 ${
              isToday
                ? 'bg-gradient-to-tr from-amber-500 via-pink-500 to-rose-500 ring-4 ring-amber-300/60'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500'
            }`}>
              {isToday ? '🎂' : firstLetter}
            </div>

            {/* Name & Basic Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {currentPerson.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {currentPerson.relationship}
                </span>
                {zodiac && (
                  <span className="text-xs text-slate-400 font-medium">
                    ({zodiac})
                  </span>
                )}
              </div>

              {/* Birthday Date & Age/Countdown */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
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

          {/* Right Badge & Unified Celebrate Action */}
          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-xs ${badge.className}`}>
              {badge.text}
            </span>

            {/* CELEBRATE BUTTON - Shown on Today's Birthday */}
            {isToday && (
              <button
                type="button"
                onClick={handleCelebrate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 hover:from-amber-500 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transform active:scale-95 transition-all"
                title="Celebrate Birthday!"
              >
                <PartyPopper className="w-4 h-4" />
                <span>🎉 Celebrate!</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Notes & Reminders */}
        {(currentPerson.notes || currentPerson.reminder_days) && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {currentPerson.notes && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1 text-[10px]">
                  💡 Notes & Ideas:
                </span>
                <p className="text-slate-600 italic">"{currentPerson.notes}"</p>
              </div>
            )}
            {currentPerson.reminder_days && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
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
      <section id="wish-studio" className="bg-white rounded-3xl border border-warm-200/90 p-6 sm:p-8 shadow-card space-y-6">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-xs transition-all active:scale-95"
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
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
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
              className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm sm:text-base font-medium leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-y min-h-[110px]"
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
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-sm transform active:scale-95 transition-all"
                title="Send via WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              {/* Instagram Button */}
              <button
                type="button"
                onClick={handleSendInstagram}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-sm transform active:scale-95 transition-all"
                title="Send via Instagram Direct"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Instagram</span>
              </button>

              {/* Facebook / Messenger Button */}
              <button
                type="button"
                onClick={handleSendFacebook}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-sm transform active:scale-95 transition-all"
                title="Send via Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>Facebook</span>
              </button>

              {/* Snapchat Button */}
              <button
                type="button"
                onClick={handleSendSnapchat}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#FFFC00] hover:bg-[#F2EE00] text-slate-950 font-black text-xs sm:text-sm shadow-xs hover:shadow-sm transform active:scale-95 transition-all border border-amber-300"
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
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm border transition-all active:scale-95 shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
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
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-all active:scale-95 shadow-xs"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Share...</span>
            </button>

            {/* SMS Button */}
            <button
              type="button"
              onClick={handleSendSMS}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-all active:scale-95 shadow-xs"
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
          onClick={() => {
            triggerHaptic('light');
            onBack();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 group"
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

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Bell, BellOff, CheckCircle2, AlertTriangle, Smartphone, 
  Sparkles, Send, Play, PartyPopper,
  Download, Upload, Database, Check, Loader2, ArrowLeft
} from 'lucide-react';
import { 
  getNotificationPermission, 
  isNotificationSupported, 
  requestNotificationPermission, 
  sendTestNotification, 
  NotificationPermissionState 
} from '../utils/notificationService';
import { 
  CelebrationSoundType, 
  CELEBRATION_SOUNDS, 
  getStoredCelebrationSound, 
  setStoredCelebrationSound, 
  playCelebrationSound 
} from '../utils/celebrationService';
import { 
  triggerDownloadBackup, 
  validateBackupPayload, 
  importBackupData, 
  BirthdayBackupPayload 
} from '../utils/birthdayRepository';
import { pushNav, popNav, AppNavState } from '../utils/navigation';
import { fireBirthdayConfetti } from '../utils/confetti';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const [permission, setPermission] = useState<NotificationPermissionState>('unsupported');
  const [testSent, setTestSent] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');
  const [selectedSound, setSelectedSound] = useState<CelebrationSoundType>('party_pop');

  // Backup & Restore State
  const [isExporting, setIsExporting] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<BirthdayBackupPayload | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const [confirmReplaceText, setConfirmReplaceText] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
      setTestSent(false);
      setStatusFeedback('');
      setSelectedSound(getStoredCelebrationSound());
      setPendingBackup(null);
      setImportMode('merge');
      setConfirmReplaceText(false);
    }
  }, [isOpen]);

  // Listen for history popstate to dismiss nested import confirmation
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as AppNavState | null;
      if (state && state.view !== 'import_confirm') {
        setPendingBackup(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      setStatusFeedback('Notifications enabled successfully! 🎉');
    } else if (res === 'denied') {
      setStatusFeedback('Permission was blocked in your browser settings. You can re-enable it in browser site settings.');
    }
  };

  const handleSendTest = async () => {
    const success = await sendTestNotification();
    if (success) {
      setTestSent(true);
      setStatusFeedback('Test notification sent! Check your notification center 🎉');
      setTimeout(() => setTestSent(false), 3000);
    } else {
      setStatusFeedback('Could not send test notification. Make sure permission is granted.');
    }
  };

  const handleSoundChange = (sound: CelebrationSoundType) => {
    setSelectedSound(sound);
    setStoredCelebrationSound(sound);
    if (sound !== 'none') {
      playCelebrationSound(sound);
    }
  };

  const handlePreviewSound = () => {
    if (selectedSound !== 'none') {
      playCelebrationSound(selectedSound);
    }
  };

  // Export Backup
  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const result = await triggerDownloadBackup();
      setStatusFeedback(`Backup downloaded! Exported ${result.count} birthdays to ${result.filename} 💾`);
    } catch (err: any) {
      setStatusFeedback(err.message || 'Failed to export backup.');
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger File Picker
  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // File Selected for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const payload = validateBackupPayload(text);
        setPendingBackup(payload);
        pushNav('import_confirm');
        setImportMode('merge');
        setConfirmReplaceText(false);
      } catch (err: any) {
        setStatusFeedback(err.message || "That doesn't look like a valid Birthday Buddy backup.");
      }
    };
    reader.onerror = () => {
      setStatusFeedback('Failed to read the selected backup file.');
    };
    reader.readAsText(file);
  };

  // Dismiss Import Modal with History Sync
  const handleCancelImportModal = () => {
    setPendingBackup(null);
    popNav();
  };

  // Perform Import
  const handleExecuteImport = async () => {
    if (!pendingBackup) return;

    try {
      setIsImporting(true);
      const result = await importBackupData(pendingBackup, importMode);
      
      fireBirthdayConfetti();
      onDataChanged?.();

      if (importMode === 'replace') {
        setStatusFeedback(`Restored ${result.importedCount} birthdays successfully! 🎂`);
      } else {
        const duplicateMsg = result.skippedDuplicates > 0 ? ` (${result.skippedDuplicates} duplicates skipped)` : '';
        setStatusFeedback(`Merged ${result.importedCount} new birthdays!${duplicateMsg} 🎉`);
      }

      setPendingBackup(null);
      popNav();
    } catch (err: any) {
      setStatusFeedback(err.message || 'Failed to import backup.');
    } finally {
      setIsImporting(false);
    }
  };

  const isSupported = isNotificationSupported();

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex justify-center items-start sm:items-center p-0 sm:p-4 transition-opacity"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-warm-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 min-h-screen sm:min-h-0 sm:my-6 flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        {/* Sticky/Pinned Modal Header */}
        <div className="sticky top-0 z-20 px-5 sm:px-8 pt-4 pb-4 bg-gradient-to-r from-purple-100/95 via-pink-100/85 to-amber-100/95 border-b border-warm-200/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-purple-700 border border-warm-300/80 text-xs font-extrabold shadow-xs active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-purple-600" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shadow-xs active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-600 text-white shadow-sm">
                <Sparkles className="w-3 h-3" /> Preferences
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1">
              Settings & Backup ⚙️
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage sounds, reminders, and offline data backups
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6">
          {/* Status Feedback Banner */}
          {statusFeedback && (
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>{statusFeedback}</span>
            </div>
          )}

          {/* 1. DATA & BACKUP (OFFLINE STORAGE) */}
          <div className="bg-warm-50/80 rounded-2xl p-5 border border-warm-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-purple-600" />
                <span>Data & Backup</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Local
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your birthdays are stored securely on this device. Export a backup if you want to move them to another phone or keep a safe offline copy.
            </p>

            {/* Hidden JSON file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Actions: Export / Import */}
            <div className="pt-1 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isExporting}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Backup (.json)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTriggerFileInput}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-warm-100 text-slate-700 border border-warm-300 text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>Import Backup</span>
              </button>
            </div>
          </div>

          {/* 2. CELEBRATION PREFERENCES */}
          <div className="bg-warm-50/80 rounded-2xl p-5 border border-warm-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <PartyPopper className="w-3.5 h-3.5 text-purple-600" />
                <span>Celebration Sound</span>
              </span>
              {selectedSound !== 'none' && (
                <button
                  type="button"
                  onClick={handlePreviewSound}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-700 shadow-sm transition-all active:scale-95"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Preview</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CELEBRATION_SOUNDS.map((s) => {
                const isSelected = selectedSound === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => handleSoundChange(s.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs font-bold ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-slate-700 border-warm-200 hover:bg-warm-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{s.emoji}</span>
                      <span className="leading-tight">{s.label}</span>
                    </div>
                    {isSelected && <Sparkles className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 font-medium pt-0.5">
              Played only when you explicitly tap the <strong>🎉 Celebrate!</strong> button on today's birthdays.
            </p>
          </div>

          {/* 3. NOTIFICATION STATUS BOX */}
          <div className="bg-warm-50/80 rounded-2xl p-5 border border-warm-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-purple-600" />
                <span>Notification Status</span>
              </span>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                permission === 'granted'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : permission === 'denied'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {permission === 'granted' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Enabled</span>
                  </>
                ) : permission === 'denied' ? (
                  <>
                    <BellOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>Blocked</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Needs Permission</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {permission === 'granted'
                ? 'Birthday Buddy will remind you of upcoming and same-day birthdays when you open the app or while it is active in your browser.'
                : permission === 'denied'
                ? 'Notifications are blocked in your browser settings. To receive reminders, click the lock/settings icon in your browser address bar and allow notifications.'
                : 'Enable browser notifications so Birthday Buddy can alert you when a friend or family member has an upcoming birthday.'}
            </p>

            {/* Enable or Test Actions */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              {permission !== 'granted' && isSupported && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Enable Browser Notifications</span>
                </button>
              )}

              {permission === 'granted' && (
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={testSent}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-warm-100 text-slate-700 border border-warm-300 text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-purple-600" />
                  <span>{testSent ? 'Test Sent! 🎉' : 'Send Test Reminder'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 4. Honest Platform Transparency Note */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>How Reminders Work</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Birthday Buddy runs 100% on your device without servers. Reminders are checked when the app opens or while running. For best results on mobile, add Birthday Buddy to your Home Screen.
            </p>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* IMPORT CONFIRMATION MODAL */}
      {pendingBackup && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-warm-200 overflow-hidden p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Import Birthday Backup
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Found <strong>{pendingBackup.people.length} birthdays</strong> in backup file
                </p>
              </div>
            </div>

            {/* Choose Import Mode */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Choose Import Mode
              </label>

              {/* 1. Merge Mode (Default) */}
              <button
                type="button"
                onClick={() => {
                  setImportMode('merge');
                  setConfirmReplaceText(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between ${
                  importMode === 'merge'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-400/40 shadow-sm'
                    : 'border-warm-200 bg-warm-50/70 text-slate-700 hover:bg-warm-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900">🔄 Merge with Current</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-200 text-purple-900 font-bold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Adds new birthdays and automatically skips existing duplicates.
                  </p>
                </div>
                {importMode === 'merge' && <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />}
              </button>

              {/* 2. Replace Mode */}
              <button
                type="button"
                onClick={() => {
                  setImportMode('replace');
                  setConfirmReplaceText(true);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between ${
                  importMode === 'replace'
                    ? 'border-rose-600 bg-rose-50 text-rose-950 ring-2 ring-rose-400/40 shadow-sm'
                    : 'border-warm-200 bg-warm-50/70 text-slate-700 hover:bg-warm-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-rose-700">⚠️ Replace All Data</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Removes your current list and restores only the imported backup.
                  </p>
                </div>
                {importMode === 'replace' && <Check className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
              </button>
            </div>

            {/* Replace Warning Confirmation */}
            {confirmReplaceText && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>Are you sure? This will permanently delete your existing birthday list.</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelImportModal}
                disabled={isImporting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isImporting}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
                  importMode === 'replace'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <span>{importMode === 'replace' ? 'Replace & Restore' : 'Merge & Import'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

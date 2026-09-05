import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, PartyPopper, Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Person, PersonInput } from './types';
import { fetchUpcomingBirthdays, createPerson, updatePerson, deletePerson } from './api';
import { Header } from './components/Header';
import { BirthdayHero } from './components/BirthdayHero';
import { BirthdayCard } from './components/BirthdayCard';
import { AddPersonModal } from './components/AddPersonModal';
import { BirthdayDetailPage } from './components/BirthdayDetailPage';
import { SettingsModal } from './components/SettingsModal';
import { EmptyState } from './components/EmptyState';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { BottomNav } from './components/BottomNav';
import { BuddiesScreen } from './components/BuddiesScreen';
import { NotificationPermissionDialog } from './components/NotificationPermissionDialog';
import { ReminderSetupDialog } from './components/ReminderSetupDialog';
import { checkAndSendBirthdayReminders } from './utils/notificationService';
import { initHistoryState, pushNav, popNav, AppNavState } from './utils/navigation';
import { initStatusBar } from './utils/statusBarService';
import { initTheme } from './utils/themeService';
import { 
  checkNotificationPermission, 
  requestNotificationPermission, 
  schedulePersonBirthdayReminders,
  initNotificationChannel,
  syncAllBirthdayReminders
} from './utils/localNotificationsService';

export function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Active Navigation View ('home' | 'buddies')
  const [activeTab, setActiveTab] = useState<'home' | 'buddies'>('home');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Screen Navigation
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedDetailPerson, setSelectedDetailPerson] = useState<Person | null>(null);

  // Post-Add Notification & Reminder Dialog States (Capacitor Android only)
  const [isNotificationPermissionOpen, setIsNotificationPermissionOpen] = useState<boolean>(false);
  const [isReminderSetupOpen, setIsReminderSetupOpen] = useState<boolean>(false);
  const [newlyAddedPerson, setNewlyAddedPerson] = useState<Person | null>(null);

  // State Refs for Android Back Button Listener (avoids stale closures and competing listeners)
  const activeTabRef = useRef<'home' | 'buddies'>('home');
  const selectedDetailPersonRef = useRef<Person | null>(null);
  const isAddModalOpenRef = useRef(false);
  const isSettingsOpenRef = useRef(false);
  const isNotificationPermissionOpenRef = useRef(false);
  const isReminderSetupOpenRef = useRef(false);
  const lastBackPressRef = useRef<number>(0);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    selectedDetailPersonRef.current = selectedDetailPerson;
  }, [selectedDetailPerson]);

  useEffect(() => {
    isAddModalOpenRef.current = isAddModalOpen;
  }, [isAddModalOpen]);

  useEffect(() => {
    isSettingsOpenRef.current = isSettingsOpen;
  }, [isSettingsOpen]);

  useEffect(() => {
    isNotificationPermissionOpenRef.current = isNotificationPermissionOpen;
  }, [isNotificationPermissionOpen]);

  useEffect(() => {
    isReminderSetupOpenRef.current = isReminderSetupOpen;
  }, [isReminderSetupOpen]);

  // Load upcoming birthdays from local IndexedDB
  const loadUpcomingBirthdays = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchUpcomingBirthdays();
      setPeople(data);

      // Check and trigger in-app/browser reminders if due
      checkAndSendBirthdayReminders(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load birthdays from local database');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Toast Feedback Helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Initial load, Safe Area, History & Capacitor Back Button setup
  useEffect(() => {
    const cleanupTheme = initTheme();
    loadUpcomingBirthdays().then(async (data) => {
      if (Capacitor.isNativePlatform()) {
        try {
          const perm = await checkNotificationPermission();
          if (perm === 'granted') {
            if (data.length > 0) {
              await syncAllBirthdayReminders(data);
            }
          } else {
            // First-time startup check: prompt user if permission not granted and prompt not yet answered
            const hasAnsweredPrompt = localStorage.getItem('bb_notif_prompt_answered');
            if (!hasAnsweredPrompt) {
              setTimeout(() => {
                setIsNotificationPermissionOpen(true);
              }, 600);
            }
          }
        } catch (err) {
          console.warn('Notification startup check notice:', err);
        }
      }
    });
    initHistoryState();
    initStatusBar();
    initNotificationChannel();

    // 1. Unified Capacitor Native Android Back Button & Back Gesture listener
    const backListenerPromise = CapacitorApp.addListener('backButton', () => {
      // Priority 1: Reminder Setup Dialog
      if (isReminderSetupOpenRef.current) {
        setIsReminderSetupOpen(false);
        return;
      }
      // Priority 2: Notification Permission Dialog
      if (isNotificationPermissionOpenRef.current) {
        setIsNotificationPermissionOpen(false);
        return;
      }
      // Priority 3: Add Person Modal
      if (isAddModalOpenRef.current) {
        setIsAddModalOpen(false);
        return;
      }
      // Priority 4: Settings Modal
      if (isSettingsOpenRef.current) {
        setIsSettingsOpen(false);
        return;
      }
      // Priority 5: Birthday Detail View -> return to previous view
      if (selectedDetailPersonRef.current) {
        setSelectedDetailPerson(null);
        return;
      }
      // Priority 6: Buddies Screen -> return to Home
      if (activeTabRef.current === 'buddies') {
        setActiveTab('home');
        pushNav('home');
        return;
      }
      // Priority 7: Home / Root Screen -> 2-press back exit window (2000ms)
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        CapacitorApp.exitApp();
      } else {
        lastBackPressRef.current = now;
        showToast('Press back again to exit');
      }
    });

    // 2. Web browser popstate synchronization
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as AppNavState | null;

      if (!state || state.view === 'home' || state.view === 'dashboard') {
        setIsAddModalOpen(false);
        setIsSettingsOpen(false);
        setSelectedDetailPerson(null);
        setActiveTab('home');
      } else if (state.view === 'buddies') {
        setIsAddModalOpen(false);
        setIsSettingsOpen(false);
        setSelectedDetailPerson(null);
        setActiveTab('buddies');
      } else if (state.view === 'detail') {
        setIsAddModalOpen(false);
        setIsSettingsOpen(false);
        if (state.personId) {
          const person = people.find((p) => p.id === state.personId);
          if (person) {
            setSelectedDetailPerson(person);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      cleanupTheme();
      window.removeEventListener('popstate', handlePopState);
      backListenerPromise.then((sub) => sub.remove()).catch(() => {});
    };
  }, []);

  // Sync selected person if people list updates in background
  useEffect(() => {
    if (selectedDetailPerson) {
      const fresh = people.find((p) => p.id === selectedDetailPerson.id);
      if (fresh) {
        setSelectedDetailPerson(fresh);
      }
    }
  }, [people]);

  // Modal Open Handlers with History integration
  const handleOpenAddModal = () => {
    pushNav('add');
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    popNav();
  };

  const handleOpenSettings = () => {
    pushNav('settings');
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    popNav();
  };

  // Detail View Handlers with History
  const handleOpenDetail = (person: Person) => {
    pushNav('detail', person.id);
    setSelectedDetailPerson(person);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCloseDetail = () => {
    setSelectedDetailPerson(null);
    popNav();
  };

  // Navigation tab switcher (Home vs Buddies)
  const handleSelectTab = (tab: 'home' | 'buddies') => {
    if (selectedDetailPerson) {
      setSelectedDetailPerson(null);
    }
    setActiveTab(tab);
    pushNav(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Data Handlers
  const handleAddPerson = async (data: PersonInput) => {
    const created = await createPerson(data);
    await loadUpcomingBirthdays();

    // 1. Standard Web Browser Mode:
    // Pure web experience — no native Capacitor permission prompts or errors
    if (!Capacitor.isNativePlatform()) {
      showToast(`🎉 Added ${created.name} to Birthday Buddy!`);
      return;
    }

    // 2. Capacitor Android Native Mode:
    try {
      const currentPerm = await checkNotificationPermission();
      if (currentPerm === 'granted') {
        // Permission is already granted: schedule reminders for the new person directly
        await schedulePersonBirthdayReminders(created);
        showToast(`🎉 Added ${created.name} & scheduled reminders! 🔔`);
      } else {
        // First-time notification prompt: check if user previously chose Maybe Later
        const hasAnsweredPrompt = localStorage.getItem('bb_notif_prompt_answered');
        if (!hasAnsweredPrompt) {
          setNewlyAddedPerson(created);
          setIsNotificationPermissionOpen(true);
        } else {
          // Do not repeatedly annoy the user if they choose Maybe Later
          showToast(`🎉 Added ${created.name} to Birthday Buddy!`);
        }
      }
    } catch {
      showToast(`🎉 Added ${created.name} to Birthday Buddy!`);
    }
  };

  // First-Time Notification Pre-Permission Dialog Handlers (Capacitor Android only)
  const handleAllowNotifications = async () => {
    localStorage.setItem('bb_notif_prompt_answered', 'true');
    setIsNotificationPermissionOpen(false);

    if (!Capacitor.isNativePlatform()) return;

    const status = await requestNotificationPermission();
    if (status === 'granted') {
      if (newlyAddedPerson) {
        await schedulePersonBirthdayReminders(newlyAddedPerson);
      }
      await syncAllBirthdayReminders(people);
      showToast('🔔 Birthday reminders enabled!');
    } else {
      showToast('Notifications not enabled');
    }
  };

  const handleNotNowNotifications = () => {
    localStorage.setItem('bb_notif_prompt_answered', 'true');
    setIsNotificationPermissionOpen(false);
    if (newlyAddedPerson) {
      showToast(`🎉 Added ${newlyAddedPerson.name} to Birthday Buddy!`);
    }
  };

  // Post-Permission Reminder Setup Dialog Handlers
  const handleSetReminders = async () => {
    if (newlyAddedPerson && Capacitor.isNativePlatform()) {
      await schedulePersonBirthdayReminders(newlyAddedPerson);
      showToast(`🔔 Reminders active for ${newlyAddedPerson.name}!`);
    }
    setIsReminderSetupOpen(false);
  };

  const handleSkipReminders = () => {
    setIsReminderSetupOpen(false);
    if (newlyAddedPerson) {
      showToast(`🎉 Added ${newlyAddedPerson.name} to Birthday Buddy!`);
    }
  };

  const handleUpdatePerson = async (id: number, data: Partial<PersonInput>): Promise<Person> => {
    const updated = await updatePerson(id, data);
    await loadUpcomingBirthdays();
    // Refresh scheduled notifications if reminders changed on native
    if (Capacitor.isNativePlatform()) {
      await schedulePersonBirthdayReminders(updated);
    }
    showToast(`🎉 Updated ${updated.name}'s details!`);
    return updated;
  };

  const handleDeletePerson = async (id: number) => {
    await deletePerson(id);
    setPeople((prev) => prev.filter((p) => p.id !== id));
    setSelectedDetailPerson(null);
    popNav();
    showToast('Removed person from your list.');
  };

  // Seed sample mock data for instant preview
  const handleSeedSampleData = async () => {
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentDay = String(today.getDate()).padStart(2, '0');

    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    const m3 = String(in3Days.getMonth() + 1).padStart(2, '0');
    const d3 = String(in3Days.getDate()).padStart(2, '0');

    const samplePeople: PersonInput[] = [
      {
        name: 'Sarah Chen',
        birthday: `1998-${currentMonth}-${currentDay}`, // Today!
        relationship: 'Best Friend',
        notes: 'Loves bubble tea & matcha lattes! 🍵',
        reminder_days: 'on_day,1_day_before',
        reminder_time: '09:00',
      },
      {
        name: 'Alex Morgan',
        birthday: `2000-${m3}-${d3}`, // In 3 days!
        relationship: 'Friend',
        notes: 'Classic vinyl collector 🎵',
        reminder_days: 'on_day,1_day_before,3_days_before',
        reminder_time: '09:00',
      },
      {
        name: 'Grandma Rose',
        birthday: '1952-11-20',
        relationship: 'Family',
        notes: 'Bakes the greatest chocolate cookies 🍪',
        reminder_days: 'on_day,7_days_before',
        reminder_time: '09:00',
      },
      {
        name: 'Michael Scott',
        birthday: '1985-04-15',
        relationship: 'Colleague',
        notes: "World's Best Boss mug owner ☕",
        reminder_days: 'on_day',
        reminder_time: '09:00',
      },
    ];

    try {
      for (const p of samplePeople) {
        await createPerson(p);
      }
      await loadUpcomingBirthdays();
      showToast('🎉 Loaded sample buddies!');
    } catch {
      showToast('Error seeding sample data.');
    }
  };

  // Date-Stage Breakdown for Home screen
  const todayBirthdays = people.filter((p) => (p.days_remaining ?? p.days_until ?? 999) === 0);
  const thisWeekBirthdays = people.filter((p) => {
    const d = p.days_remaining ?? p.days_until ?? 999;
    return d > 0 && d <= 7;
  });

  // Next upcoming birthday (first person overall in upcoming list)
  const nextPerson = people.length > 0 ? people[0] : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900 pb-24 sm:pb-12 transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-2xl border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header (rendered on Home & Buddies views, hidden on Birthday Detail to give Back bar priority) */}
      {!selectedDetailPerson && (
        <Header
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenAddModal={handleOpenAddModal}
          onOpenSettings={handleOpenSettings}
          totalCount={people.length}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {selectedDetailPerson ? (
          <BirthdayDetailPage
            person={selectedDetailPerson}
            onBack={handleCloseDetail}
            onDelete={handleDeletePerson}
            onUpdate={handleUpdatePerson}
          />
        ) : loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={loadUpcomingBirthdays} />
        ) : activeTab === 'buddies' ? (
          /* ============================================================ */
          /* DEDICATED BUDDIES SCREEN (Search, Filter Chips, All Buddies) */
          /* ============================================================ */
          <BuddiesScreen
            people={people}
            onViewBirthday={handleOpenDetail}
            onDelete={handleDeletePerson}
            onOpenAddModal={handleOpenAddModal}
            onSeedSampleData={handleSeedSampleData}
          />
        ) : (
          /* ============================================================ */
          /* HOME DASHBOARD SCREEN (Hero Card, Today & This Week Summary) */
          /* ============================================================ */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Spotlight Hero */}
            <BirthdayHero
              person={nextPerson}
              onViewBirthday={handleOpenDetail}
              onOpenAddModal={handleOpenAddModal}
            />

            {/* 1. 🎂 TODAY SECTION (Only shown when someone has a birthday today) */}
            {todayBirthdays.length > 0 && (
              <section className="bg-gradient-to-r from-amber-500/20 via-pink-500/15 to-purple-500/20 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-7 shadow-glow-festive animate-pulse-subtle">
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-1.5 rounded-xl bg-amber-500 text-white shadow-sm">
                    <PartyPopper className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                      <span>Today's Celebrations! 🎉</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black">
                        {todayBirthdays.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-600 font-semibold">
                      It's their special day! Tap to prepare and send your birthday wish immediately.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {todayBirthdays.map((person) => {
                    const firstLetter = person.name ? person.name.charAt(0).toUpperCase() : '?';
                    return (
                      <div
                        key={person.id}
                        onClick={() => handleOpenDetail(person)}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-amber-300 dark:border-amber-500/40 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col min-[350px]:flex-row min-[350px]:items-center justify-between gap-3 sm:gap-4 group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
                            {firstLetter}
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors truncate">
                              {person.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 text-[11px] font-bold shrink-0">
                                {person.relationship}
                              </span>
                              {person.age_turning ? (
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Turning <strong className="text-slate-700 dark:text-slate-200 font-bold">{person.age_turning}</strong>
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="w-full min-[350px]:w-auto flex justify-end shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(person);
                            }}
                            className="w-full min-[350px]:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 shrink-0 group-hover:scale-105 transition-transform"
                          >
                            <span>Send Wish 🚀</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 2. ⏰ THIS WEEK SECTION (Coming up in the next 7 days) */}
            {thisWeekBirthdays.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <span>This Week</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                          {thisWeekBirthdays.length}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Coming up in the next 7 days — prepare your wishes & gifts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {thisWeekBirthdays.map((person) => (
                    <BirthdayCard
                      key={person.id}
                      person={person}
                      onViewBirthday={handleOpenDetail}
                      onDelete={handleDeletePerson}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 3. QUICK BANNER TO COMPLETE BUDDIES DIRECTORY */}
            {people.length > 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-warm-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">
                      All Saved Buddies ({people.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Search, filter by relationship, and browse your full birthday list.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab('buddies')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-xs font-bold shadow-soft hover:shadow-soft-hover active:scale-95 transition-all flex-shrink-0"
                >
                  <span>Open Buddies List</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Empty State when zero people */}
            {people.length === 0 && (
              <EmptyState
                isSearching={false}
                onOpenAddModal={handleOpenAddModal}
                onClearSearch={() => {}}
                onSeedSampleData={handleSeedSampleData}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAddModal={handleOpenAddModal}
        totalCount={people.length}
      />

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddPerson}
      />

      {/* Post-Add Friendly Notification Permission Dialog (Capacitor Android only) */}
      <NotificationPermissionDialog
        isOpen={isNotificationPermissionOpen}
        onEnable={handleAllowNotifications}
        onMaybeLater={handleNotNowNotifications}
      />

      {/* Post-Permission Friendly Reminder Setup Dialog (Capacitor Android only) */}
      <ReminderSetupDialog
        isOpen={isReminderSetupOpen}
        person={newlyAddedPerson}
        onSetReminders={handleSetReminders}
        onSkip={handleSkipReminders}
      />

      {/* Settings Modal (Notifications, Preferences & Data Backup) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onDataChanged={loadUpcomingBirthdays}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-warm-200/60 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>Birthday Buddy — Never forget someone important 🎂</p>
      </footer>
    </div>
  );
}

export default App;

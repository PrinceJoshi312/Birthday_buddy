import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, PartyPopper, Calendar, Clock } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { Person, PersonInput } from './types';
import { fetchUpcomingBirthdays, createPerson, updatePerson, deletePerson } from './api';
import { Header } from './components/Header';
import { BirthdayHero } from './components/BirthdayHero';
import { BirthdayCard } from './components/BirthdayCard';
import { SearchBar } from './components/SearchBar';
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
import { 
  checkNotificationPermission, 
  requestNotificationPermission, 
  schedulePersonBirthdayReminders 
} from './utils/localNotificationsService';

export function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Active Bottom Navigation View ('home' | 'buddies')
  const [activeTab, setActiveTab] = useState<'home' | 'buddies'>('home');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter state for Home screen
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals & Screen Navigation
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedDetailPerson, setSelectedDetailPerson] = useState<Person | null>(null);

  // Post-Add Notification & Reminder Dialog States
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
    loadUpcomingBirthdays();
    initHistoryState();
    initStatusBar();

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
      // Priority 5: Birthday Detail View -> return to Home / Buddies
      if (selectedDetailPersonRef.current) {
        setSelectedDetailPerson(null);
        return;
      }
      // Priority 6: Buddies Screen -> return to Home
      if (activeTabRef.current === 'buddies') {
        setActiveTab('home');
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

    // 2. Web browser popstate fallback
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as AppNavState | null;

      if (!state || state.view === 'dashboard') {
        setIsAddModalOpen(false);
        setIsSettingsOpen(false);
        setSelectedDetailPerson(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseDetail = () => {
    setSelectedDetailPerson(null);
    popNav();
  };

  // Navigation tab switcher
  const handleSelectTab = (tab: 'home' | 'buddies') => {
    if (selectedDetailPerson) {
      setSelectedDetailPerson(null);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Data Handlers
  const handleAddPerson = async (data: PersonInput) => {
    const created = await createPerson(data);
    await loadUpcomingBirthdays();
    setIsAddModalOpen(false);
    popNav();

    // Check notification permission flow
    const currentPerm = await checkNotificationPermission();
    if (currentPerm === 'granted') {
      // Permission already granted: prompt reminder setup directly
      setNewlyAddedPerson(created);
      setIsReminderSetupOpen(true);
    } else if (currentPerm !== 'denied') {
      // First prompt friendly notification permission dialog
      setNewlyAddedPerson(created);
      setIsNotificationPermissionOpen(true);
    } else {
      // Denied or unsupported
      showToast(`🎉 Added ${created.name} to Birthday Buddy!`);
    }
  };

  // Post-Add Notification Permission Dialog Handlers
  const handleAllowNotifications = async () => {
    const status = await requestNotificationPermission();
    setIsNotificationPermissionOpen(false);
    if (status === 'granted' && newlyAddedPerson) {
      // Next show reminder setup dialog
      setIsReminderSetupOpen(true);
    } else {
      showToast('Notifications not enabled');
    }
  };

  const handleNotNowNotifications = () => {
    setIsNotificationPermissionOpen(false);
    if (newlyAddedPerson) {
      showToast(`🎉 Added ${newlyAddedPerson.name} to Birthday Buddy!`);
    }
  };

  // Post-Permission Reminder Setup Dialog Handlers
  const handleSetReminders = async () => {
    if (newlyAddedPerson) {
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
    // Refresh scheduled notifications if reminders changed
    await schedulePersonBirthdayReminders(updated);
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

  const categories = ['All', 'Friend', 'Best Friend', 'Family', 'Partner', 'Colleague', 'Other'];

  // Filtered people for Home screen
  const filteredPeople = people.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.notes && person.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory.toLowerCase() === 'all' ||
      (person.relationship && person.relationship.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Date-Stage Breakdown for Home screen
  const todayBirthdays = filteredPeople.filter((p) => (p.days_remaining ?? p.days_until ?? 999) === 0);
  const thisWeekBirthdays = filteredPeople.filter((p) => {
    const d = p.days_remaining ?? p.days_until ?? 999;
    return d > 0 && d <= 7;
  });
  const comingUpBirthdays = filteredPeople.filter((p) => (p.days_remaining ?? p.days_until ?? 999) > 7);

  // Next upcoming birthday (first person overall in upcoming list)
  const nextPerson = people.length > 0 ? people[0] : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900 pb-24 sm:pb-12">
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
          /* DEDICATED BUDDIES SCREEN */
          <BuddiesScreen
            people={people}
            onViewBirthday={handleOpenDetail}
            onDelete={handleDeletePerson}
            onOpenAddModal={handleOpenAddModal}
            onSeedSampleData={handleSeedSampleData}
          />
        ) : (
          /* HOME DASHBOARD SCREEN */
          <>
            {/* Top Spotlight Hero (if there are people and no active filter) */}
            {!searchQuery && selectedCategory.toLowerCase() === 'all' && (
              <BirthdayHero
                person={nextPerson}
                onViewBirthday={handleOpenDetail}
                onOpenAddModal={handleOpenAddModal}
              />
            )}

            {/* Buddies Section Anchor & Search / Filter */}
            <div id="buddies-list" className="scroll-mt-20">
              <section className="mt-8">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categories={categories}
                  totalResults={filteredPeople.length}
                />
              </section>

              {/* ACTION STAGES LAYOUT */}
              {filteredPeople.length > 0 ? (
                <div className="space-y-10 mt-6 animate-in fade-in duration-300">
                  {/* 1. 🎂 TODAY SECTION (Highest Visual Emphasis) */}
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
                              className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-300 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
                                  {firstLetter}
                                </div>
                                <div>
                                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                                    {person.name}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                                      {person.relationship}
                                    </span>
                                    {person.age_turning ? (
                                      <span>Turning <strong>{person.age_turning}</strong></span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(person);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 flex-shrink-0 group-hover:scale-105 transition-transform"
                              >
                                <span>Send Wish 🚀</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* 2. ⏰ THIS WEEK SECTION (Within 7 Days) */}
                  {thisWeekBirthdays.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
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

                  {/* 3. 📅 COMING UP SECTION (More than 7 days) */}
                  {comingUpBirthdays.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                            <Calendar className="w-4 h-4" />
                          </span>
                          <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                              <span>Coming Up</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                                {comingUpBirthdays.length}
                              </span>
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                              Sorted by nearest celebration date
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {comingUpBirthdays.map((person) => (
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
                </div>
              ) : (
                <EmptyState
                  isSearching={Boolean(searchQuery || selectedCategory.toLowerCase() !== 'all')}
                  onOpenAddModal={handleOpenAddModal}
                  onClearSearch={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  onSeedSampleData={people.length === 0 ? handleSeedSampleData : undefined}
                />
              )}
            </div>
          </>
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

      {/* Post-Add Friendly Notification Permission Dialog */}
      <NotificationPermissionDialog
        isOpen={isNotificationPermissionOpen}
        onAllow={handleAllowNotifications}
        onNotNow={handleNotNowNotifications}
      />

      {/* Post-Permission Friendly Reminder Setup Dialog */}
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
      <footer className="mt-auto py-6 border-t border-warm-200/60 text-center text-xs text-slate-400">
        <p>Birthday Buddy — Never forget someone important 🎂</p>
      </footer>
    </div>
  );
}

export default App;

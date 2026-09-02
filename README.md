# 🎂 Birthday Buddy V1

A standalone, 100% offline-first, zero-backend personal birthday assistant and reminder PWA focused on the **Remember → Remind → Prepare → Copy/Save → Open App → Send** workflow.

---

## ✨ V1 Features

- 👤 **Add, View & Edit People**: Store name, birthday date, relationship (*Friend*, *Best Friend*, *Family*, *Partner*, *Colleague*, *Other*), reminder settings, and personal notes.
- 💾 **100% Offline-First (IndexedDB)**: Runs completely self-contained in your browser or installed PWA on your phone without servers, cloud lock-in, or backend dependencies.
- ⏳ **Upcoming Birthdays Engine**: Automatically calculates remaining days, turning ages, zodiac signs, leap-year edge cases, and sorts by closest upcoming celebration.
- 🎯 **Action Stage Dashboard**: Grouped into 🎂 **Today**, ⏰ **This Week** (within 7 days), and 📅 **Coming Up**.
- 🌟 **Spotlight Hero Banner**: Highlights the closest upcoming birthday with celebration mode on birthdays happening today.
- ✍️ **5 Practical Message Styles**: Instant client-side wish generator supporting **Simple**, **Funny**, **Heartfelt**, **Formal**, and **Best Friend** tones with dynamic `{name}` replacement.
- 🟢 **One-Tap App Handoffs**:
  - **🟢 Send via WhatsApp**: Deep link (`api.whatsapp.com/send?text=...`) to pre-fill wishes into WhatsApp chats.
  - **📋 Copy to Clipboard**: Instant copy with visual feedback (*"Copied! 🎉"*).
  - **📤 Native Web Share**: Invokes `navigator.share()` on mobile with automatic clipboard fallback.
  - **💬 Send via SMS**: Opens device SMS app with pre-filled encoded message (`sms:?body=...`).
- 🎉 **Delightful Celebration Mode**: Interactive **🎉 Celebrate!** trigger with multi-angle confetti, procedural Web Audio sound synthesis, and device vibration.
- 🔔 **Advance Reminders**: In-app browser notifications for same-day and advance (1 day, 3 days, 7 days) alerts with daily deduplication.
- 📱 **Installable PWA**: Fast, responsive mobile design installable to Android and iOS home screens.

---

## 🛠️ Tech Stack

* **Architecture**: Standalone Client-Side PWA (Zero Backend)
* **Storage**: Browser IndexedDB (`BirthdayBuddyDB`)
* **Framework**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti

---

## ⚡ How to Run

```bash
cd "C:\Users\HP\OneDrive\Desktop\birthday buddy\frontend"
npm install
npm run dev
```

* **Web App URL**: [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
birthday buddy/
├── frontend/
│   ├── public/
│   │   ├── manifest.json               # PWA Web App Manifest
│   │   ├── sw.js                       # Offline Cache Service Worker
│   │   └── favicon.svg                 # Cake emoji favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx              # App brand, subtitle & Add CTA
│   │   │   ├── BirthdayHero.tsx        # Next upcoming birthday spotlight
│   │   │   ├── BirthdayCard.tsx        # Responsive birthday card
│   │   │   ├── SearchBar.tsx           # Search input & category filter chips
│   │   │   ├── AddPersonModal.tsx      # Add person modal with validation
│   │   │   ├── EditPersonModal.tsx     # Edit person modal with preloaded fields
│   │   │   ├── BirthdayDetailPage.tsx  # Detail page & wish sending studio
│   │   │   ├── SettingsModal.tsx       # Reminder, sound preferences & info
│   │   │   ├── EmptyState.tsx          # Friendly empty & search-not-found states
│   │   │   ├── LoadingSkeleton.tsx     # Animated pulse loading skeleton
│   │   │   ├── ErrorState.tsx          # Connection error & retry component
│   │   │   └── BottomNav.tsx           # Mobile bottom navigation bar
│   │   ├── utils/
│   │   │   ├── birthdayRepository.ts   # Native IndexedDB storage & CRUD repository
│   │   │   ├── dateUtils.ts            # Date calculations & leap-year math
│   │   │   ├── messageTemplates.ts     # 5-style local birthday wish engine
│   │   │   ├── celebrationService.ts   # Web Audio synthesizer, haptics & confetti
│   │   │   ├── notificationService.ts  # Browser reminder & deduplication engine
│   │   │   └── confetti.ts             # Confetti particle burst utility
│   │   ├── api.ts                      # Client-side repository export adapter
│   │   ├── types.ts                    # TypeScript types
│   │   ├── App.tsx                     # Main layout & view orchestrator
│   │   ├── main.tsx                    # React DOM root entry
│   │   └── index.css                   # Tailwind styles & scrollbars
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                            # (Legacy reference — no longer required to run)
└── README.md
```

# 🤝 Connexion: Where Business Meets Capital

**Connexion** is a high-velocity, interactive Single Page Application (SPA) investment marketplace designed to connect startup founders and verified investors. The platform combines visual pitch reels (short vertical videos) with instant matching, direct messaging, meeting scheduling, and an administrative compliance audit engine.

---

## 🚀 Key Features Implemented

### 📹 1. PitchReels (Tinder-Style Swiper)
* **Lazy Loaded Streaming:** Video elements only decode and load when a slide becomes active or adjacent, preventing CPU lag and network choke.
* **Vertical Scroll Snapping:** Smooth, full-screen vertical swipe transitions utilizing native CSS snapping.
* **Instant Interest Trigger:** Investors can mark interest directly on a reel, triggering match statuses and auto-generating communication threads.

### 💬 2. Chat & Scheduler Room
* **Clamped Viewport Layout:** Strict `h-screen overflow-hidden` grid limits that completely eliminate scrollbar jumps and layout shifts.
* **Sticky Messaging Dock:** The input box remains anchored (`sticky bottom-0`) with an opaque background to prevent messages from leaking behind it.
* **Interactive Calendar Panel:** Schedule physical or virtual meetings directly from the chat screen with pending/verified indicators.

### 🛡️ 3. Admin Compliance & Audit Console
* **Verification Auditing Queue:** Admins can view corporate filings (GST/MSME papers) submitted by startups.
* **Badge Control:** Direct action triggers to **Approve Verify** or **Reject Filings**, which update startup profiles and activate/revoke verification badges across the app in real-time.

### 🌗 4. Dynamic Theme Engine
* **Dark / Light Toggle:** Instant theme toggling available in the Navbar.
* **CSS Variable Tokens:** Tailwind CSS v4 variables mapped to semantic colors (`--bg-app`, `--card-bg`, `--text-app`) ensuring high contrast and readability on all screens.

---

## 🛠️ Technology Stack
* **Frontend Framework:** Next.js-style Client routing using **Vite + React + TypeScript**
* **Routing Shell:** **TanStack Router** (fully type-safe routes & layouts)
* **State Management:** **Zustand** (managing mock database seed profiles, meetings, and notifications)
* **Styling (CSS):** **Tailwind CSS v4** (CSS-first variables `@theme` layer)
* **Icons & Charts:** **Lucide React** & **Recharts**

---

## ⚙️ Getting Started & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to inspect the application.

### 3. Build the Production Bundle
```bash
npm run build
```

---

## 🔑 Seeded Test Accounts

To test the different portals, click **Log In / Get Started**, select the corresponding role card, and enter any mock email/password.

| Role | Test User Name | Key Features |
|---|---|---|
| **Investor** | Anita Singh | Tracked startups list, meeting scheduler, reels swiping. |
| **Business** | Dr. Siddharth Sen (*Aura Biotech*) | Upload GST/MSME papers, upload video reels, view metrics chart. |
| **Administrator** | Admin Console | Verification filings queue, approve/reject GST/MSME audits, activate badges. |
# Sona_Hackathon

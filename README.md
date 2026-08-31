# 🌊 AniFlow — Modern Anime Discovery & Tracking Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-6%2B-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/API-Kitsu_REST_API-FF6565?logo=kitsu&logoColor=white" alt="Kitsu API" />
</p>

**AniFlow** is a lightning-fast, modern anime discovery and tracking web application built using **React**, **Tailwind CSS v4**, and the **Kitsu REST API**. It allows users to browse trending shows, search and filter across thousands of anime titles with debounced querying, view detailed synopsis/trailer/episode listings, and manage a personalized local watchlist.

---

## ✨ Features Built

- **🔥 Home Discovery Hub (`/`):**
  - High-impact dynamic **Hero Spotlight** featuring the #1 trending title.
  - Horizontally scrollable carousels for *Trending Now*, *Top Rated Classics*, and *Most Popular*.
  - Responsive cards with score badges, format tags (TV, Movie, OVA), and quick-action triggers.

- **🧭 Explore & Advanced Search (`/explore`):**
  - **Debounced real-time search** with deep URL query parameter synchronization (`?q=`, `?category=`, `?sort=`, `?page=`).
  - Multi-category genre pill filters (Action, Shounen, Fantasy, Romance, etc.).
  - Sorting by Popularity, Score, Newest, and Oldest.
  - Server-side offset pagination with bounded limits.

- **🎬 Anime Details & Media Player (`/anime/:id`):**
  - Parallax-style backdrop cover art and high-res poster presentation.
  - Comprehensive metadata metrics: Popularity ranking, age ratings, season years, and score distributions.
  - **Auto-Paginated Episode Engine:** Recursively fetches complete episode listings beyond default page limits.
  - **Smart Episode Chunking:** Tabbed range selectors (`1–50`, `51–100`, etc.) for fluid scrolling on massive series (e.g., *One Piece*, *Naruto*).
  - Embedded responsive **YouTube Trailer Player** with privacy-enhanced playback (`youtube-nocookie.com`).

- **📑 Local Watchlist & Tracker (`/watchlist`):**
  - Global `WatchlistContext` synchronized with browser `localStorage`.
  - Granular status categorizations: *Plan to Watch*, *Watching*, *Completed*, *Dropped*.
  - Status filter tabs, quick bookmark toggling from cards, and bulk-clearing support.

---

## 🛠️ Tech Stack

- **Framework:** [React 18+](https://react.dev/)
- **Build Tool:** [Vite](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom dark slate palettes
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Source:** [Kitsu REST API (JSON:API v4)](https://kitsu.docs.apiary.io/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm, pnpm, or yarn

### Installation

1. **Clone the repository:**
```bash
   git clone [https://github.com/your-username/aniflow.git](https://github.com/PrajwalSH1930/aniflow.git)
   cd aniflow

```

2. **Install dependencies:**
```bash
npm install

```


3. **Start the development server:**
```bash
npm run dev

```


4. **Build for production:**
```bash
npm run build

```



---

## 📂 Project Structure

```text
aniflow/
├── public/
├── src/
│   ├── components/
│   │   ├── AnimeCard.jsx          # Reusable anime card with hover animations & bookmarking
│   │   ├── AnimeCarousel.jsx      # Scrollable horizontal media track
│   │   ├── HeroSpotlight.jsx      # Spotlight hero banner for top trending title
│   │   └── Navbar.jsx             # Sticky global navigation & quick search
│   ├── context/
│   │   └── WatchlistContext.jsx   # Context & provider for state & localStorage sync
│   ├── hooks/
│   │   └── useDebounce.js         # Custom debounce hook for search inputs
│   ├── pages/
│   │   ├── AnimeDetails.jsx       # Details page with tabs, episodes, and trailers
│   │   ├── Explore.jsx            # Multi-filter search & pagination grid
│   │   ├── Home.jsx               # Main landing page
│   │   └── Watchlist.jsx          # Personalized watchlist manager
│   ├── services/
│   │   └── kitsuApi.js            # Kitsu API client, deserializer, and pagination loop
│   ├── App.jsx                    # Application routing & context wrapping
│   ├── index.css                  # Tailwind v4 theme configuration
│   └── main.jsx                   # React root mount
├── package.json
├── vite.config.js
└── README.md

```

---

## 📌 Master Development Roadmap (TODOs)

### 🎨 1. UI/UX & Polish

* [ ] **Skeleton Loaders:** Add shimmering placeholders for all cards, heroes, and details tabs to eliminate layout shifts.
* [ ] **Global Error Boundary:** Catch runtime issues with a custom fallback screen and "Retry" action.
* [ ] **Toast Notifications:** Add slide-in alerts when items are added to or removed from the watchlist.
* [ ] **Image Fallback Handler:** Display stylized fallback SVGs when Kitsu posters or banners return broken image links.
* [ ] **Back-to-Top Button:** Floating smooth-scroll button on long listings.

### 🧩 2. Details Page Enhancements

* [ ] **Cast & Characters Roster:** Query `/anime/{id}/characters` and `/castings` to render character avatars and voice actors.
* [ ] **Media Relations Tree:** Display connected prequels, sequels, side-stories, and movies.
* [ ] **User Reviews Feed:** Display community reviews from Kitsu's `/anime/{id}/reviews` endpoint.
* [ ] **Episode Search & Filter:** Add an in-page search input to find specific episodes by title or episode number.
* [ ] **Episode Watch Progress:** Allow users to mark individual episodes as "Watched" with a visual progress bar.

### 🔍 3. Discovery & Exploration Features

* [ ] **Seasonal Anime Browser:** Add a seasonal selector (`/seasons/spring-2026`, `/seasons/fall-2025`).
* [ ] **Studio & Producer Explorer:** Filter anime by animation studios (e.g., MAPPA, Ufotable, Bones).
* [ ] **Random Anime Generator ("Surprise Me"):** Button that redirects the user to a curated, high-rated random title.
* [ ] **Infinite Scroll Toggle:** Option to toggle between standard pagination buttons and seamless infinite scroll.

### 💾 4. Data, User & Tracking System

* [ ] **Export / Import Watchlist:** Support exporting watchlist data to JSON and importing from MyAnimeList/AniList XML/JSON.
* [ ] **Custom User Scores & Notes:** Allow users to attach private notes and 1–10 star ratings to their saved list entries.
* [ ] **Watching Stats Dashboard:** Compute total time spent watching anime, favorite genres breakdown, and completed series counts.
* [ ] **Manga Integration:** Expand API services to include manga reading status and chapter trackers (`/manga`).

### ⚡ 5. Performance & Architecture

* [ ] **Client-Side In-Memory Cache:** Cache API responses for visited routes using React Query or TanStack Query.
* [ ] **PWA (Progressive Web App):** Configure offline service worker support for viewing the watchlist without internet.
* [ ] **SEO & Dynamic Meta Tags:** Implement `react-helmet-async` for dynamic OpenGraph tags per anime title.

---

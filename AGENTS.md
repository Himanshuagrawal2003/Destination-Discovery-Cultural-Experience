# CultureQuest — Complete Developer & Agent Guide (AGENTS.md)

This living document contains the complete context, feature specifications, real-image pipeline, database architecture, and operational rules for **CultureQuest (Destination Discovery & Cultural Experience)**.

---

## 📌 1. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Redux Toolkit, Framer Motion, Lucide & React Icons, Leaflet / OpenStreetMap, Axios, React Hot Toast
- **Backend**: Node.js, Express, MongoDB (Mongoose), Cloudinary SDK, Google Gemini AI SDK (`@google/genai` / `@google/generative-ai`)
- **Image Source Standard**: Wikipedia REST API & Wikimedia Commons (100% Genuine, Authenticated Landmark & Cultural Photography)

---

## 📸 2. Image Management & Real Landmark Pipeline

### ⚠️ Strict Operational Rule
> **NEVER generate AI images for real-world destinations, events, or monuments.**
> **NEVER use random stock photo IDs or placeholders.**
> Every image on CultureQuest must be a **real, authentic photograph** of the exact destination landmark, monument, temple, or cultural event.

### 🗂️ Cloudinary Folder Hierarchy
```
culturequest/
  ├── destinations/
  │    └── {destination-slug}/
  │         ├── {slug}_cover_real.jpg
  │         └── gallery/
  │              ├── {slug}_real_1.jpg
  │              ├── {slug}_real_2.jpg
  │              └── ...
  └── events/
       └── {destination-or-event-slug}/
            └── event_{event-slug}_real.jpg
```

### 🔄 Dynamic Destination Generation Flow
When a user searches for any destination not yet in MongoDB (e.g. *Jaipur*, *Tokyo*, *Shimla*):
1. **AI Generation**: Gemini AI generates rich profile data: description, history, culture, coordinates, best season, budget, famous foods, famous places, and hidden gems.
2. **Parallel Landmark Image Fetching**: Backend extracts the destination name, famous places, and highlights, and queries the **Wikipedia REST API** in parallel (`Promise.all`):
   ```javascript
   const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(landmarkName)}`;
   // User-Agent: 'CultureQuestApp/1.0 (contact@culturequest.com; developer)'
   ```
3. **Cloudinary Upload**: Downloaded image buffers are uploaded to `culturequest/destinations/{slug}/gallery/`.
4. **Data Sync**: The destination is created with synchronized `coverImage`, `gallery` (4-6 photos), and `images` (4-6 photos).

---

## 🌟 3. Complete Feature Modules & Workflows

### 🏛️ Destination Discovery & Detail Page (`/destinations`, `/destinations/:id`)
- **Search-First Discovery UX (`/destinations`)**: Destinations are not dumped in bulk on page load, and no unrequested trending suggestions are displayed; users start at a clean, dedicated search interface.
- **Personalized Per-User Exploration**: All-user global dump is completely eliminated. When a user searches or explores a destination, it is dynamically linked to their individual account (`user.exploredDestinations` & `createdBy`). User A only sees their own searched/explored destinations; User B only sees theirs.
- **Hero Banner**: Full-bleed real landmark cover image with dynamic brightness filter and title overlays.
- **Cultural Highlights & History**: Deep historical narratives, cultural significance, and best times to visit.
- **Famous Foods & Hidden Gems**: Curated local culinary recommendations and off-the-beaten-path spots.
- **Gallery & Photo Tour**: Responsive grid showing 4-6 authentic landmark photographs with a full-screen **Lightbox Modal** (supporting keyboard navigation `Left`, `Right`, `Escape`).
- **Interactive Map**: Embedded Leaflet map showing precise geospatial coordinates.
- **Upcoming Festivals**: Destination-matched cultural events and festivals.
- **User Reviews & Star Ratings**: Interactive review submission, rating breakdowns, and pagination.

### 🗺️ AI Trip Planner & Custom Itineraries (`/trip-planner`, `/ai/recommend`)
- **AI-Powered Day-by-Day Itineraries**: Generated based on traveler preferences, budget levels, and travel style.
- **Saved Trips Management**: Stored under user profile with destination references.

### 💎 Cultural Hidden Gems AI Explorer (`/hidden-gems`, `/api/ai/hidden-gems`)
- **Interactive Multi-Mode Search**: Support for both Wishlist/Vibe descriptions and specific Country/Region targeting.
- **Card-Level Multi-Tab Layout**:
  - 📑 **Vibe & Lore**: Cultural significance, estimated daily costs in INR (`Avg. ₹... / day`), and ideal season.
  - 🧭 **How to Reach**: Step-by-step route logistics, nearest hub, and budget breakdowns (Stay, Food, Ride).
  - 🗝️ **Local Secrets & Food**: Local lore, secret viewpoints, traditional delicacies, and essential tips.
  - 🗺️ **Interactive Leaflet Map**: Direct geospatial pin with exact coordinates.
- **Direct Action Triggers**: Instant bookmarking to user profile and one-click "Plan Itinerary Here" navigation.

### 🎭 Events & Festivals (`/events`)
- **Cultural Events Grid**: Categorized by type (`festival`, `food-fair`, `religious`, `traditional-performance`).
- **Authentic Festival Photography**: Every event displays real photos of the celebration.

### 🔖 Bookmarking System (`/bookmarks`)
- **Universal Bookmarks**: Users can bookmark destinations, events, and trips with instant UI feedback and database persistence.

### 🔐 Authentication, Password Reset & Dual Email Pipeline (`/forgot-password`, `/reset-password/:token`)
- **Forgot Password Flow**: Generates secure SHA-256 hashed reset token valid for 10 minutes.
- **Dynamic URL Resolution**: Automatically detects domain from request Origin/Referer and `FRONTEND_URL` / `CLIENT_URL` to ensure reset links work seamlessly on both localhost and production deployment.
- **Dual Email Delivery Engine**:
  - **Resend HTTPS REST API**: First-class support via `RESEND_API_KEY`. Operates over HTTPS (Port 443) which bypasses Render/Vercel cloud SMTP port blocking with 100% deliverability.
  - **Nodemailer SMTP Fallback**: Supports Gmail App Password for local development environments.

### 🌓 Theme & UI Aesthetics
- **Dark & Light Modes**: Managed via Redux Toolkit (`uiSlice`) with persistent local storage and smooth CSS transitions.
- **Vibrant & Glassmorphic Design**: Rounded corners (`rounded-2xl`, `rounded-3xl`), subtle gradients, and Framer Motion micro-animations.

---

## 🗄️ 4. Database Schema Summary

### `Destination` (`backend/models/Destination.js`)
- `name` (String, required), `slug` (String, unique)
- `country`, `city`, `category` (String)
- `description`, `history`, `culture` (String)
- `coverImage` (String URL)
- `gallery` (Array of String URLs — Real Landmark Photos)
- `images` (Array of String URLs — Synchronized with gallery)
- `famousFoodsList` (`[{ name, description }]`)
- `famousPlacesList` (`[{ name, description }]`)
- `hiddenGemsList` (`[{ name, description }]`)
- `location` (`{ type: 'Point', coordinates: [lng, lat] }`)
- `rating` (`{ average: Number, count: Number }`)
- `viewCount`, `bookmarkCount`, `isFeatured`, `isActive`

### `Event` (`backend/models/Event.js`)
- `title`, `type`, `description`
- `coverImage` / `image` (Cloudinary Real Event Photo URL)
- `startDate`, `endDate`, `time`
- `location` (`{ country, city, venue, address, lat, lng }`)
- `price` (`{ isFree: Boolean, amount: Number, currency: String }`)

### `Review` (`backend/models/Review.js`)
- `destination` (Ref Destination), `user` (Ref User), `rating` (1-5), `comment`

---

## 🛠️ 5. Maintenance & Utility Scripts (`backend/scripts/`)

- `node scripts/audit_and_enforce_all.js`
  - Runs a platform-wide audit of all destinations and events to verify 100% real image compliance.
- `node scripts/sync_images_field.js`
  - Synchronizes `images` array with `gallery` array across all destinations.
- `node scripts/sync_real_images_to_cloudinary.js`
  - Master pipeline for fetching real Wikipedia landmark photos and uploading to Cloudinary.
- `node scripts/inspect_db.js`
  - Prints database contents in clean JSON format.

---

## 📱 6. Mobile Application-Style Dynamic Responsiveness Standard

- **Fluid Typography**: Page titles and `<h1>` elements scale dynamically via `text-xl sm:text-2xl md:text-3xl font-black font-display tracking-tight leading-snug`.
- **Single-Line Mobile Fits**: Accompanying icons use `shrink-0 text-lg sm:text-2xl` to prevent breaking titles into disjointed multiple lines on compact mobile screens (360px–430px).
- **Smooth Horizontal Touch Navigation**: Top dashboard & AI sub-menus use `overflow-x-auto no-scrollbar` pill badges with active high-contrast states.

---

## 📝 7. Continuous Memory & Living Documentation Rule

> **MANDATORY RULE FOR ALL DEVELOPERS & AI AGENTS:**
> 1. Whenever you add new features, endpoints, schemas, or modify workflows, you **MUST update this `AGENTS.md` file**.
> 2. Always preserve the **100% Real Landmark Photograph standard** across all modules.
> 3. Preserve all existing features (Trip Planner, Bookmarks, Map, Reviews, Dark Mode, Events) in future updates.

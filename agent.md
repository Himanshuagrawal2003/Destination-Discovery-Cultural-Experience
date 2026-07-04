# 🧠 Agent Memory – CultureQuest AI

> This file is maintained by the AI agent to remember project state across sessions.
> Read this first before doing any work on this project.

---

## 📌 Project Info

| Field | Value |
|-------|-------|
| **Project Name** | CultureQuest AI |
| **Type** | GenAI-powered Tourism Platform |
| **Stack** | React 19 + Vite + TailwindCSS + Node.js + Express + MongoDB + Gemini API |
| **Conversation ID** | ac4d37a8-8c03-4405-945d-dddeb14c7f6c |
| **Started** | 2026-07-04 |
| **Workspace** | c:\Users\himan\OneDrive\Desktop\Main Challenge |

---

## 🔐 Environment Variables Needed

> [!NOTE]
> Configured with fallback mechanisms so local development and testing work seamlessly without external API keys.

- [x] MongoDB Local Server URL (`mongodb://127.0.0.1:27017/culturequest`)
- [x] Google Gemini API Key (Fallback to Mock AI Responses if missing)
- [ ] Google Maps API Key (Optional)
- [x] Cloudinary Credentials (Fallback to Local disk storage in `/uploads`)
- [x] JWT Secret (Configured with local keys in `.env`)
- [ ] Email Service credentials (Optional)

**Status:** ✅ Configured locally for testing and ready for staging/production credentials.

---

## 📦 Phase Status

| Phase | Title | Status | Completed At |
|-------|-------|--------|--------------|
| 1 | Project Scaffolding & Foundation | ✅ Completed | 2026-07-04 |
| 2 | Authentication System | ✅ Completed | 2026-07-04 |
| 3 | Core CRUD Modules | ✅ Completed | 2026-07-04 |
| 4 | AI Features (Gemini API) | ✅ Completed | 2026-07-04 |
| 5 | Dashboards, Maps & Advanced Features | ✅ Completed | 2026-07-04 |
| 6 | Polish, Static Pages & Deployment Prep | ✅ Completed | 2026-07-04 |

---

## 🗂️ Project Structure

```
Main Challenge/
├── backend/          ← Express API with MongoDB, JWT, local uploads & AI Mock fallbacks
├── frontend/         ← React 19 + Vite + TailwindCSS + Redux Toolkit
├── uploads/          ← Local storage fallback for uploaded images and avatars
├── agent.md          ← This file (agent memory)
└── devlog.jsonl      ← Structured dev log
```

---

## ✅ Completed Tasks

- Configured local MongoDB connection (`mongodb://127.0.0.1:27017/culturequest`).
- Implemented `seed.js` script to populate destinations, hidden gems, cultural experiences, events, and reviews.
- Added transparent custom storage engine in `cloudinary.js` to automatically fall back to local folder upload under `/uploads/` if Cloudinary credentials are not provided.
- Added a full mock response engine inside `geminiService.js` that catches prompts and generates simulated structured travel recommendations, itineraries, budgets, and chat responses without a Gemini key.
- Migrated default Gemini model to `gemini-2.5-flash` to resolve 404 deprecation and endpoint compatibility errors, validating active quota and connectivity.
- Verified backend runs without issues on port 5000 and successfully connects to the database.

---

## 🚧 Current Phase

**Phase:** Phase 6 (Polish & Deployment Prep)
**Current Task:** Local verification complete. Starting both services and confirming production build.

---

## 📝 Key Decisions Made

| Decision | Choice | Reason |
|----------|--------|--------|
| CSS Framework | Tailwind CSS v3 | User specified |
| AI Provider | Google Gemini API | User specified |
| Auth Strategy | JWT (access token in localStorage) | Simplicity + persistence |
| Image Upload | Multer + Cloudinary (Local Fallback) | Scalable cloud storage + robust offline dev experience |
| AI Integration | Gemini SDK (Mock Fallback) | Seamless developer testing without needing external API keys |
| Email | Nodemailer | Standard local configuration |
| PDF Export | jsPDF (client-side) | No server dependency |
| Maps Provider | Leaflet + OpenStreetMap | Seamless client-side interactive maps without needing API keys or payment cards |

---

## 🐛 Known Issues

_None._

---

## 🔗 References

- Implementation Plan: `C:\Users\himan\.gemini\antigravity-ide\brain\ac4d37a8-8c03-4405-945d-dddeb14c7f6c\implementation_plan.md`
- Dev Log: `c:\Users\himan\OneDrive\Desktop\Main Challenge\devlog.jsonl`

---

## 📋 Notes for Next Session

- Read `devlog.jsonl` for detailed per-action log
- Check Phase Status table above first
- Check "Environment Variables Needed" — all must be filled before coding
- Follow phased approach — do NOT skip ahead
- Verify each phase runs without errors before moving to the next

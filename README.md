# CultureQuest — AI-Powered Destination Discovery & Cultural Experience Platform
A modern, AI-powered **travel discovery and cultural experience platform** designed to help users discover authentic destinations, explore local culture, find hidden gems, and create personalized travel itineraries. Built using the modern **MERN Stack (MongoDB, Express.js, React.js (Vite), Node.js)** with **Google Gemini AI**, CultureQuest brings destination discovery, trip planning, cultural events, interactive maps, and personalized travel experiences together in one platform. 🚀

---

## ✨ Key Features

- 🤖 **AI-Powered Destination Discovery:** Generate rich destination information including history, culture, food, best season, budget, and hidden attractions using Google Gemini AI
- 🗺️ **AI Trip Planner:** Generate personalized day-by-day travel itineraries based on destination, budget, preferences, and travel style
- 💎 **Hidden Gems Explorer:** Discover lesser-known destinations using vibe/wishlist or country/region-based searches
- 🏛️ **Cultural Discovery:** Explore destination history, local culture, traditional food, and unique experiences
- 🎭 **Events & Festivals:** Discover cultural festivals, food fairs, religious events, and traditional performances
- 📸 **Real Destination Images:** Fetch authentic landmark photographs through Wikipedia/Wikimedia and store them using Cloudinary
- 📍 **Interactive Maps:** Explore destinations and locations using Leaflet and OpenStreetMap
- 🔖 **Bookmarks:** Save destinations, events, and trips for quick access
- ⭐ **Reviews & Ratings:** Share travel experiences through ratings and reviews
- 🔐 **Secure Authentication:** JWT-based authentication with access/refresh tokens and password recovery
- 🌓 **Dark & Light Mode:** Modern responsive interface with persistent theme preferences
- 📱 **PWA Support:** Install CultureQuest as an installable application on mobile and desktop

---

## 🤖 AI Features

- 🌍 **Destination Recommendations:** Personalized destination suggestions using Google Gemini AI
- 💎 **Hidden Gem Discovery:** Discover unique places based on user preferences, vibe, or region
- 🗺️ **AI Trip Planning:** Generate structured day-by-day itineraries
- 📖 **Cultural Intelligence:** Generate destination history, culture, food, and travel information
- 💰 **Budget Information:** Provide estimated travel costs and budget-oriented suggestions

---

## 🛠️ Tech Stack

**Frontend 💻:**
- ⚛️ **React.js 18** (Component-based frontend)
- ⚡ **Vite** (Fast development and build tooling)
- 🎨 **Tailwind CSS** (Modern and responsive UI styling)
- 🧠 **Redux Toolkit** (State management)
- 🎬 **Framer Motion** (Smooth UI animations)
- 🗺️ **Leaflet + OpenStreetMap** (Interactive maps)
- 🔗 **Axios** (API communication)

**Backend ⚙️:**
- 🟢 **Node.js & Express.js** (REST API and server)
- 🍃 **MongoDB & Mongoose** (NoSQL database)
- 🤖 **Google Gemini AI** (AI-powered travel intelligence)
- ☁️ **Cloudinary** (Image storage and delivery)
- 🔑 **JWT & bcryptjs** (Secure authentication and password hashing)
- 🛡️ **Helmet & express-rate-limit** (API security)
- ✅ **express-validator** (Request validation)
- 📧 **Resend & Nodemailer** (Email delivery)

---

## 📂 Project Structure

```text
CultureQuest/
│
├── ⚙️ backend/                 # Express Server, API Routes & Database
│   ├── config/                 # Database & Cloudinary configuration
│   ├── controllers/            # Application controllers
│   ├── middlewares/            # Authentication & error handling
│   ├── models/                 # Mongoose database models
│   ├── routes/                 # REST API routes
│   ├── services/               # External services
│   ├── utils/                  # AI & image utilities
│   ├── validators/             # Request validation
│   ├── scripts/                # Utility & maintenance scripts
│   └── server.js               # Express server
│
├── 🎨 frontend/                # Vite React Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Application pages
│   │   ├── redux/              # Redux store & slices
│   │   ├── services/           # API service layer
│   │   ├── hooks/              # Custom React hooks
│   │   └── layouts/            # Page layouts
│   └── public/                 # PWA manifest & icons
│
├── 📄 AGENTS.md
└── 📄 README.md
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/culturequest.git
cd culturequest
```

### 2️⃣ Setup Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
```

**🔑 Environment Variables:** Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_api_key

RESEND_API_KEY=your_resend_api_key

CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

**▶️ Run the backend server:**

```bash
npm run dev
# Server generally starts on 🔗 http://localhost:5000
```

### 3️⃣ Setup Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

**▶️ Run the frontend app:**

```bash
npm run dev
# Frontend generally starts on 🔗 http://localhost:5173
```

> 🔐 **Important:** Never commit `.env` files, API keys, database credentials, or JWT secrets to GitHub.

---

## 🌐 Main API Modules

- 🔐 **Authentication:** `/api/auth/*`
- 🏛️ **Destinations:** `/api/destinations/*`
- 🤖 **AI Recommendations:** `/api/ai/recommend`
- 💎 **Hidden Gems:** `/api/ai/hidden-gems`
- 🗺️ **AI Trip Planner:** `/api/ai/trip-plan`
- 🧳 **Trips:** `/api/trips/*`
- 🎭 **Events:** `/api/events/*`
- ⭐ **Reviews:** `/api/reviews/*`
- 🔖 **Bookmarks:** `/api/bookmarks/*`

---

## 🔮 Future Enhancements

- 🧠 **RAG-Based Travel Intelligence:** Improve factual grounding of AI-generated information
- 🌐 **Multilingual Support:** Provide destination information in multiple languages
- 🎯 **Smarter Recommendations:** Improve personalization and destination ranking
- 💰 **Advanced Budget Planning:** Optimize complete trips according to user budgets
- 🧪 **Automated Testing & CI/CD:** Improve reliability and deployment workflows
- ⚡ **Caching & Performance Optimization:** Improve application performance

---

## 📜 License & Purpose

<p align="center">
 This project is developed as an <strong>AI-powered full-stack application</strong> for learning, innovation, and demonstrating modern web development and AI integration. 🎓
</p>

---

<p align="center">

### 🧭 CultureQuest
**Explore beyond the obvious.** 🌍

Built with ❤️ using <strong>React, Node.js, MongoDB & Gemini AI</strong>.

⭐ Star the repository if you find it useful!

</p>

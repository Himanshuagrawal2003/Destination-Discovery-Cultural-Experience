# 🌍 CultureQuest AI – AI-Powered Cultural Tourism Platform

CultureQuest AI is a next-generation MERN travel application that enables travelers to explore immersive local stories, discover authentic hidden gems, participate in traditional festivals, and build smart travel plans powered by **Gemini AI**.

The application features a premium UI/UX design with **Royal Indigo & Electric Cyan** aesthetics, fully responsive layouts, active **Cloudinary** media storage, and offline-ready **Leaflet + OpenStreetMap** maps.

---

## ✨ Features

- **🤖 AI Travel Tools:** Generate day-wise itineraries, target budget plans, food guides, and cultural guidelines powered by `gemini-2.5-flash`. Includes a mock engine fallback if no API key is set.
- **🗺️ Interactive Map Views:** Leaflet maps and markers populated directly from MongoDB GeoJSON coordinates.
- **🌅 Image Uploads:** Live image storage on Cloudinary, supporting automatic configuration string parsing (`cloudinary://`).
- **🛡️ Admin & Control Panel:** Track total users, manage destinations, experiences, events, and reviews.
- **📱 Fully Responsive:** Collapsible filters on mobile, horizontal scrollable tab bars for sub-navigation on tablets, and dynamic layouts.
- **🌓 Dark Mode:** Sleek obsidian dark mode background with dark navy cards and custom scrollbars.

---

## 🛠️ Tech Stack

- **Frontend:** React, Redux Toolkit, Tailwind CSS, Vite, Framer Motion, Recharts, React Hot Toast
- **Backend:** Node.js, Express, MongoDB (Mongoose), Cloudinary SDK, Google Generative AI SDK, Nodemailer
- **Maps:** Leaflet, React Leaflet, OpenStreetMap

---

## ⚙️ Configuration Setup

Create a `.env` file inside both folders with the following configuration details:

### 1. Backend Config (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://himanshuagrawal7766_db_user:<db_password>@distination.3eoxfzj.mongodb.net/?appName=Distination
JWT_SECRET=supersecretjwtkey123
JWT_EXPIRE=30d

# Cloudinary Storage
CLOUDINARY_API_SECRET=cloudinary://[api_key]:[api_secret]@[cloud_name]

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here

# Mail Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=zlcu jrai yqaf xnsx
```

### 2. Frontend Config (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Seed the Database
Populate your MongoDB Atlas database with realistic travel destinations, hidden gems, reviews, and admin accounts:
```bash
cd backend
npm run seed
```

### 3. Run the Development Servers
Open two terminal windows to run both servers concurrently:
```bash
# Start Backend (on http://localhost:5000)
cd backend
npm run dev

# Start Frontend (on http://localhost:5173)
cd frontend
npm run dev
```

---

## 🔐 Credentials for Local Testing

Use the following seeded accounts to log in:

*   **Administrator Account:**
    *   **Email:** `admin@culturequest.ai`
    *   **Password:** `adminpassword123`
*   **Standard User Account:**
    *   **Email:** `user@culturequest.ai`
    *   **Password:** `userpassword123`

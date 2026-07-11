# 🏋️ Fitness Buddy — AI-Powered Health & Fitness Coach

<div align="center">

![Fitness Buddy](https://img.shields.io/badge/Fitness%20Buddy-AI%20Coach-4f8ef7?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48dGV4dCB5PSIuOWVtIiBmb250LXNpemU9IjkwIj7wn4+X77iPPC90ZXh0Pjwvc3ZnPg==)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![IBM WatsonX](https://img.shields.io/badge/IBM%20WatsonX-Granite-BE95FF?style=for-the-badge&logo=ibm&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22d97e?style=for-the-badge)

**Your personal AI-powered fitness coach — workouts, nutrition, calorie tracking, and daily motivation.**

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [📁 Project Structure](#-project-structure) · [🔧 Configuration](#-configuration) · [🤖 AI Integration](#-ai-integration)

</div>

---

## 📖 Overview

**Fitness Buddy** is a conversational, AI-powered health and fitness web application that acts as your personal virtual coach — available 24/7, completely free, and personalized to your individual goals.

Built with **Node.js + Express** on the backend and **vanilla HTML/CSS/JavaScript** on the frontend, it integrates with **IBM Granite via WatsonX.ai** for intelligent responses, with a rich smart-mock fallback engine that works even without API credentials.

### 🎯 The Problem It Solves

> In today's fast-paced world, many individuals struggle to maintain a healthy lifestyle due to lack of personalized guidance, time constraints, and inconsistent motivation. Traditional fitness solutions often require expensive subscriptions, in-person consultations, or rigid schedules.

**Fitness Buddy** provides:
- On-demand fitness advice with no subscriptions
- Personalized guidance based on your level, goals & equipment
- A calorie tracker you can actually use every day
- Motivation and habit-building strategies powered by AI

---

## ✨ Features

### 💬 AI Chat Coach
- Conversational AI coach with a warm, encouraging persona
- **8 quick-action chips** for instant access to common queries
- Topics: Workouts · Meal Plans · Motivation · Calorie Guide · Pre/Post Workout Fuel · Recovery · Goal Setting · Hydration
- Full conversation history maintained per session
- Animated typing indicator & smooth message slide-in animations
- Markdown-rendered AI responses (tables, bold, lists, blockquotes)

### 🔥 Daily Calorie Tracker
- Set a **custom daily calorie goal** with 7 quick presets (1,400–3,200 kcal)
- **Animated progress ring** showing % of daily goal consumed
- **Macro breakdown** — Protein / Carbs / Fat with animated progress bars
- **Food log** grouped by meal (Breakfast / Lunch / Dinner / Snack)
- **12 quick-add common foods** (banana, eggs, chicken breast, oats, etc.)
- Manual food entry with full macro fields (Protein, Carbs, Fat)
- **"Ask AI" button** — jump to chat to ask Buddy about any food's calories
- Data persists in `localStorage` — tracks 7-day history
- Daily totals row with per-meal summaries

### 💪 Workout Planner
- **AI-generated workout routines** customized by:
  - Fitness Level: Beginner / Intermediate / Advanced
  - Type: Home · Cardio · Strength · HIIT · Yoga/Flexibility
  - Duration: 20 / 30 / 45 / 60 minutes
- **Workout history log** with calorie burn estimates
- Workouts trigger **streak updates** on the dashboard

### 📊 Progress Dashboard
- **🔥 Streak counter** — tracks consecutive active days
- **Stats cards**: AI conversations · Calories today · Workouts this week · Days active
- **Weekly calorie bar chart** — 7-day visual history (color-coded: blue = logged, green = on-goal, coral = today)
- **Daily motivational quotes** with a shuffle button (12 curated quotes)

### 👤 User Profile
- Fitness Level · Primary Goal · Available Equipment · Dietary Preference · Calorie Goal
- Auto-syncs calorie goal to the tracker
- **Auto-opens on first visit** to personalize advice immediately
- Settings persist across sessions

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### 1. Clone / Download

```bash
# If using git
git clone <your-repo-url>
cd "Fittens Buddy"

# Or just navigate to the project folder
cd "c:\Users\<you>\Desktop\Fittens Buddy"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment (Optional)

Copy `.env` and add your IBM credentials *(skip this step to use mock mode)*:

```bash
# .env is already created — just fill in your credentials
```

```env
IBM_API_KEY=your_ibm_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_SERVICE_URL=https://eu-de.ml.cloud.ibm.com
PORT=3000
```

> **Note:** If credentials are left blank, the app runs on the intelligent **mock engine** — no setup required!

### 4. Start the Server

```bash
npm start
```

### 5. Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser. 🎉

---

## 📁 Project Structure

```
Fittens Buddy/
│
├── 📄 package.json                 # Project metadata & dependencies
├── 📄 .env                         # Environment variables (IBM credentials)
├── 📄 README.md                    # You are here!
│
├── 📂 server/                      # Backend (Node.js + Express)
│   ├── 📄 server.js                # Entry point — Express app, port 3000
│   ├── 📂 config/
│   │   └── 📄 ibm.config.js        # IBM WatsonX.ai connection config
│   ├── 📂 routes/
│   │   └── 📄 chat.routes.js       # API endpoints: /api/chat, /api/workout, /api/meal
│   └── 📂 services/
│       ├── 📄 granite.service.js        # IBM Granite AI wrapper + system prompt
│       └── 📄 mock-granite.service.js   # Intelligent keyword-driven mock responses
│
└── 📂 public/                      # Frontend (Vanilla HTML/CSS/JS)
    ├── 📄 index.html               # Single Page Application (4 views)
    ├── 📂 css/
    │   └── 📄 styles.css           # Full design system (dark mode, glassmorphism)
    └── 📂 js/
        ├── 📄 app.js               # Navigation, AI chat, profile, toast, particles
        ├── 📄 calories.js          # Calorie & macro tracker module
        ├── 📄 workout.js           # Workout generator & history logger
        └── 📄 dashboard.js         # Streak, stats, weekly chart, quotes
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `IBM_API_KEY` | ❌ Optional | *(empty)* | IBM Cloud API key for WatsonX.ai |
| `WATSONX_PROJECT_ID` | ❌ Optional | *(empty)* | WatsonX.ai project ID |
| `WATSONX_SERVICE_URL` | ❌ Optional | `https://us-south.ml.cloud.ibm.com` | WatsonX.ai service endpoint |
| `PORT` | ❌ Optional | `3000` | Server port |
| `NODE_ENV` | ❌ Optional | `development` | Environment mode |

> ✅ **The app works fully without any credentials** using the built-in mock engine.

### Available npm Scripts

```bash
npm start      # Start production server
npm run dev    # Start with nodemon (auto-restart on file changes)
```

---

## 🤖 AI Integration

### IBM Granite via WatsonX.ai (Live Mode)

When IBM credentials are provided, the app connects to **IBM Granite 3 8B Instruct** through WatsonX.ai and uses a fitness-focused system prompt:

```
You are Buddy — an empathetic, knowledgeable, and motivating AI fitness coach.
You specialize in personalized health and fitness guidance...
```

The system prompt automatically adapts based on the user's **profile** (fitness level, goals, equipment, dietary preference).

### Smart Mock Engine (Default Mode)

When credentials are absent or unavailable, the mock engine provides **rich, structured responses** across 10 categories:

| Category | Topics Covered |
|---|---|
| 🏠 Home Workouts | Beginner/Intermediate/Advanced bodyweight circuits |
| 🏃 Cardio | Interval training, HIIT, beginner cardio |
| 🏋️ Strength | Dumbbell supersets, compound movements |
| 🥗 Meal Plans | Weight loss, muscle gain, vegetarian (with full macros) |
| ⚡ Pre/Post Workout | Nutrition timing and food choices |
| 💧 Hydration | Daily targets, workout hydration guide |
| 💪 Motivation | 3 unique motivational messages with habit tips |
| 😴 Recovery | Rest day guide, foam rolling, sleep optimization |
| 🎯 Goals | SMART goal framework with 8-week templates |
| 🍽️ Calorie Reference | Common food database with protein/carbs/fat breakdown |

---

## 🎨 Design System

| Property | Value |
|---|---|
| **Theme** | Dark mode (deep navy `#080c18`) |
| **Primary Color** | Electric blue `#4f8ef7` |
| **Accent Color** | Coral `#ff6b35` |
| **Success Color** | Neon green `#22d97e` |
| **Fonts** | `Outfit` (headings) + `Inter` (body) — Google Fonts |
| **Cards** | Glassmorphism with `backdrop-filter: blur()` |
| **Animations** | Floating particles, message slide-ins, progress ring, typing pulse |
| **Layout** | Mobile-first, fully responsive (480px → desktop) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/chat` | Main AI chat endpoint |
| `POST` | `/api/workout` | Generate structured workout plan |
| `POST` | `/api/meal` | Generate a meal plan |

### Example: Chat Request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Give me a beginner home workout",
    "history": [],
    "context": {
      "fitnessLevel": "beginner",
      "goals": "weight loss",
      "equipment": "no equipment"
    }
  }'
```

### Example Response

```json
{
  "success": true,
  "reply": "## 🏠 Beginner Home Workout (30 min)\n\n**Warm-up (5 min)**...",
  "model": "fitness-buddy-mock-v1",
  "source": "mock",
  "timestamp": "2026-07-11T00:00:00.000Z"
}
```

---

## 🗂️ Data Storage

All user data is stored **locally in the browser** using `localStorage` — no database required, no data sent to external servers.

| Key | Content |
|---|---|
| `fb_profile` | User fitness profile (level, goals, diet, etc.) |
| `fb_calories` | Food log entries keyed by date (7-day history) |
| `fb_calorie_goal` | Daily calorie target |
| `fb_workouts` | Workout history (last 50 entries) |
| `fb_streak` | Streak count + last active date |
| `fb_chat_count` | Total AI conversations count |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+ |
| **Backend Framework** | Express.js 4.x |
| **AI Provider** | IBM Granite 3 8B Instruct (via WatsonX.ai) |
| **Security** | Helmet.js, CORS |
| **Frontend** | Vanilla HTML5 + CSS3 + JavaScript (ES2022) |
| **Fonts** | Google Fonts (Inter + Outfit) |
| **Storage** | localStorage (client-side) |
| **Deployment** | Any Node.js host (Railway, Render, Heroku, etc.) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- **IBM WatsonX.ai** for the Granite language model
- **Google Fonts** for Inter & Outfit typefaces
- Inspired by the challenge of making fitness guidance accessible to everyone

---

<div align="center">

Made with ❤️ and 💪 by the **Fitness Buddy Team**

*Start your fitness journey today — your future self will thank you!* 🚀

</div>

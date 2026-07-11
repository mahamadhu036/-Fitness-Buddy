# 🏋️ Fitness Buddy — Implementation Plan

> AI-Powered Personal Fitness Coach using IBM Granite on WatsonX.ai

---

## 📋 Project Overview

**Fitness Buddy** is a full-stack AI-powered fitness coaching web application. The solution solves the problem of inaccessible, expensive, and impersonalized fitness guidance by providing a 24/7 AI coach powered by IBM Granite (via IBM WatsonX.ai Lite).

---

## 🎯 Problem Statement

In today's fast-paced world, many individuals struggle to maintain a healthy lifestyle due to:
- Lack of personalized guidance
- High cost of personal trainers
- Inconsistent motivation and habit tracking
- No accessible tool for daily calorie and workout logging

**Fitness Buddy** addresses all of these through a conversational AI interface backed by IBM's enterprise-grade Granite LLMs.

---

## ✅ Goals & Requirements

### Functional Requirements

| # | Requirement | Status |
|---|---|---|
| 1 | AI Chat Coach powered by IBM Granite | ✅ Implemented |
| 2 | Daily Calorie Tracker with macro breakdown | ✅ Implemented |
| 3 | Workout Planner (log & track sessions) | ✅ Implemented |
| 4 | BMI & TDEE Calculator | ✅ Implemented |
| 5 | Achievement & Streak System | ✅ Implemented |
| 6 | Agentic AI — Plan / Execute / Reflect loop | ✅ Implemented |
| 7 | Safety detection for harmful fitness queries | ✅ Implemented |
| 8 | Offline fallback (mock Granite service) | ✅ Implemented |

### Non-Functional Requirements

| # | Requirement | Approach |
|---|---|---|
| 1 | IBM Cloud Lite compatible | WatsonX.ai free tier, no paid services |
| 2 | Works without IBM credentials | Intelligent mock fallback service |
| 3 | Secure API key handling | `.env` file + `.gitignore` exclusion |
| 4 | Multi-region resilience | Auto-detects working IBM region |
| 5 | Fast response time | Mock fallback < 100ms if IBM unavailable |

---

## 🏗️ Architecture Design

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                       │
│         HTML5 + Vanilla CSS + Vanilla JavaScript            │
│   Dashboard | Workout | Calories | AI Chat | Achievements   │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST API (HTTP/JSON)
┌───────────────────────▼─────────────────────────────────────┐
│              BACKEND — Node.js + Express.js                  │
│                                                             │
│  /api/chat   →  chat.routes.js  →  granite.service.js       │
│  /api/agent  →  agent.routes.js →  agent.service.js         │
│                                                             │
│  ibm.config.js (credentials, model IDs, generation params)  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS (IBM IAM Auth)
┌───────────────────────▼─────────────────────────────────────┐
│              IBM CLOUD — WatsonX.ai (Lite)                  │
│                                                             │
│   Models: ibm/granite-3-1-8b-base, ibm/granite-4-h-small   │
│   Auth:   IBM IAM (IamAuthenticator + API Key)              │
│   Regions: eu-de → us-south → eu-gb (auto-detect)          │
└───────────────────────┬─────────────────────────────────────┘
                        │ Fallback if IBM unavailable
┌───────────────────────▼─────────────────────────────────────┐
│              INTELLIGENT MOCK SERVICE                        │
│   mock-granite.service.js                                   │
│   - Safety checker, Workout templates, Meal plans           │
│   - BMI calculator, Hydration guides, Motivation            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 IBM Technologies Used

| IBM Service | Usage | SDK/Package |
|---|---|---|
| **IBM WatsonX.ai** | LLM text generation for AI coaching | `@ibm-cloud/watsonx-ai` v1.1.2 |
| **IBM Granite 3.1 8B Base** | Primary chat model | `ibm/granite-3-1-8b-base` |
| **IBM Granite 4 Small** | Lightweight model option | `ibm/granite-4-h-small` |
| **IBM IAM Authentication** | Secure API key auth | `ibm-cloud-sdk-core` v5.0.2 |
| **IBM Cloud Foundry** | Deployment platform | `manifest.yml` |

---

## 🔄 Agentic AI Design (Plan → Execute → Reflect)

### Phase 1: PLANNER 🗓️
- **Trigger:** User requests a weekly fitness plan
- **Action:** IBM Granite generates a structured 7-day JSON plan
- **Output:** Daily workouts, meals, calorie targets, motivational tips

### Phase 2: EXECUTOR ⚙️
- **Trigger:** User asks about a specific food or workout
- **Action:** Agent selects the correct tool to call
- **Tools Available:**
  - `getFoodCalories(food_name)` — nutritional lookup
  - `getWorkoutDetails(type, level, duration)` — calorie burn estimate
  - `logEntry(type, data)` — log workout or meal
- **Output:** Tool result + confirmation message

### Phase 3: REFLECTOR 📊
- **Trigger:** End of week or user requests progress review
- **Action:** IBM Granite analyzes actual history vs planned targets
- **Output:** Adherence score (0–100), wins, improvements, adjusted next-week plan

---

## 📁 File Structure

```
Fitness-Buddy/
├── public/                          # Frontend (served statically)
│   ├── index.html                   # Main single-page application
│   ├── css/
│   │   └── styles.css               # Global styles + animations
│   └── js/
│       ├── agent.js                 # Agentic AI UI interactions
│       ├── achievements.js          # Badge & streak system
│       ├── calories.js              # Calorie tracker logic
│       ├── dashboard.js             # Dashboard charts & stats
│       └── workout.js               # Workout logger
├── server/                          # Backend (Node.js)
│   ├── server.js                    # Express app entry point
│   ├── config/
│   │   └── ibm.config.js            # IBM credentials & model config
│   ├── routes/
│   │   ├── agent.routes.js          # /api/agent endpoints
│   │   └── chat.routes.js           # /api/chat endpoint
│   └── services/
│       ├── granite.service.js       # IBM WatsonX.ai integration
│       ├── mock-granite.service.js  # Intelligent offline fallback
│       └── agent.service.js         # Agentic loop (Plan/Execute/Reflect)
├── docs/
│   ├── implementation_plan.md       # This document
│   └── walkthrough.md               # Walkthrough & demo guide
├── .env.example                     # Environment variable template
├── manifest.yml                     # IBM Cloud Foundry deployment config
├── package.json                     # Dependencies
└── README.md                        # Project documentation
```

---

## 🔐 Environment Variables

```env
IBM_API_KEY=your_ibm_api_key_here
WATSONX_PROJECT_ID=your_watsonx_project_id_here
WATSONX_SERVICE_URL=https://eu-de.ml.cloud.ibm.com
PORT=3000
NODE_ENV=development
```

> ⚠️ `.env` is excluded from Git via `.gitignore`. Use `.env.example` as a template.

---

## 🚀 Deployment Plan

### Local Development
```bash
npm install
cp .env.example .env    # Fill in IBM credentials
npm start               # Runs on http://localhost:3000
```

### IBM Cloud Foundry (Production)
```bash
ibmcloud login
ibmcloud target -o YOUR_ORG -s YOUR_SPACE
ibmcloud cf push
```

---

## 🛡️ Safety & Guardrails

The system includes regex-based safety detection BEFORE sending to IBM Granite:

| Pattern Detected | Warning Type | Action |
|---|---|---|
| "Lose 10kg in a week" | `extreme_loss` | Explains risks + safe alternative |
| "500 calories per day" | `starvation` | Explains dangers + redirects |
| "Train 7 days in a row" | `overtraining` | Explains OTS + rest day importance |

---

## ✅ Verification Plan

### Automated
- `npm start` — Server starts on port 3000
- IBM connection test fires on startup (logged to console)
- Fallback auto-activates if IBM credentials are missing

### Manual Testing Checklist

| Test | Expected Result |
|---|---|
| Open `localhost:3000` | App loads with animated dashboard |
| Click "Quick Workout" chip | AI returns structured workout plan |
| Type "Lose 10kg in a week" | Safety warning displayed |
| Fill in profile (age/weight/height) | BMI + TDEE calculated instantly |
| Log a meal in Calories tab | Macro bars update with animation |
| Request weekly plan via Agent tab | 7-day JSON plan rendered |

---

*Document generated: July 2026 | Project: Fitness Buddy | IBM WatsonX.ai Integration*

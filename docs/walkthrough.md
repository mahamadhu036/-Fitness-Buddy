# 🏋️ Fitness Buddy — Project Walkthrough

> A complete demo guide and feature walkthrough for the AI-powered fitness coach application.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v8+
- (Optional) IBM Cloud account with WatsonX.ai access

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mahamadhu036/-Fitness-Buddy.git
cd Fitness-Buddy

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your IBM credentials (or leave blank for mock mode)

# 4. Start the server
npm start
# Server runs at http://localhost:3000
```

---

## 🖥️ Application Demo Walkthrough

### Step 1: Dashboard

When you open the app, you see the **Dashboard**:

- 📊 **BMI Calculator** — Enter age, gender, height, weight → instant BMI + category
- 🔥 **TDEE** — Total Daily Energy Expenditure calculated automatically
- 📈 **Weekly Progress** — Workout streak and calorie history charts
- 💡 **Daily Summary** — Today's calories consumed, workout status, water intake

**How to use:**
1. Click the **👤 Profile** button (top right)
2. Fill in: Name, Age, Gender, Height, Weight, Fitness Level, Goal, Equipment
3. BMI and TDEE calculate instantly
4. Dashboard updates with personalized targets

---

### Step 2: AI Chat Coach (Buddy)

The heart of the application — your AI-powered fitness companion.

**Quick-Action Chips (one-click responses):**
| Chip | What it does |
|---|---|
| 🏋️ Quick Workout | Returns a full workout plan for your level |
| 🥗 Meal Plan | Personalized meal plan for your goal |
| 💪 Motivate Me | Motivational quote + 10-min starter workout |
| 🔥 Calorie Guide | Your TDEE + calorie targets by goal |
| ⚡ Pre-Workout Fuel | Best foods to eat before training |
| 🍎 Post-Workout | Recovery nutrition advice |
| 😴 Recovery Tips | Rest day guide + sleep optimization |
| 🎯 Set My Goals | SMART goal framework + 12-week plan |

**How to use:**
1. Navigate to the **💬 Chat** tab
2. Click any quick chip or type your own question
3. Buddy responds with structured markdown (tables, sections, emoji headers)
4. Ask follow-up questions — conversation history is maintained

**Example conversations to try:**
- *"Give me a beginner home workout"*
- *"What should I eat for weight loss?"*
- *"How much water should I drink?"*
- *"I want to lose 10kg in a week"* ← triggers safety warning

---

### Step 3: Calorie Tracker

A full daily food diary with macro tracking.

**Features:**
- Set a daily calorie goal (1,400 – 3,200 kcal with quick presets)
- **Animated progress ring** showing % consumed
- Macro breakdown: Protein / Carbs / Fat progress bars
- Log meals: Breakfast / Lunch / Dinner / Snack
- 12 quick-add common foods (banana, eggs, chicken breast, etc.)
- Manual food entry with full macro fields
- 7-day history tracking via localStorage

**How to use:**
1. Navigate to the **🔥 Calories** tab
2. Set your goal using the slider or preset buttons
3. Click **+ Add Food** or a quick-add chip
4. View macros update in real time
5. Click **Ask AI** to chat with Buddy about any food

---

### Step 4: Workout Planner

Log and track your training sessions.

**Features:**
- Workout type selector (Home / Cardio / Strength / HIIT / Yoga)
- Duration and calories burned logging
- Notes field for workout details
- Visual weekly calendar view
- Streak counter (consecutive active days)

**How to use:**
1. Navigate to the **💪 Workout** tab
2. Select workout type and fill duration
3. Click **Log Workout**
4. View your workout history and streak

---

### Step 5: Agentic AI (FitAgent)

The most advanced feature — a 3-phase autonomous AI agent.

**Phase 1 — PLANNER 🗓️**
- Click **Generate My Week Plan**
- IBM Granite creates a complete 7-day plan in JSON format
- Each day includes: workout type, exercises, meal plan, calorie target, daily tip

**Phase 2 — EXECUTOR ⚙️**
- Agent can look up food calories: *"Get calories for chicken breast"*
- Agent can calculate workout burn: *"Estimate HIIT calories for 30 mins"*
- Agent can log entries on your behalf

**Phase 3 — REFLECTOR 📊**
- Click **Analyze My Week**
- Agent compares your actual history to your plan
- Returns adherence score (0–100), wins, areas to improve
- Suggests adjustments for next week

---

### Step 6: Achievements

Gamification to keep you motivated.

**Badges available:**
| Badge | How to Earn |
|---|---|
| 🔥 First Workout | Log your first workout |
| 📅 3-Day Streak | Work out 3 days in a row |
| 🥗 Nutrition Tracker | Log meals 5 days in a row |
| 💬 AI Explorer | Have 10 conversations with Buddy |
| 🏆 Week Champion | Complete all 7 days of a weekly plan |

---

## 🤖 IBM Granite Integration — How It Works

### Normal Flow (IBM Credentials Configured)

```
User sends message
       ↓
Express backend receives at /api/chat
       ↓
granite.service.js builds personalized system prompt
(includes user's BMI, TDEE, goals, fitness level)
       ↓
Sends to IBM WatsonX.ai via @ibm-cloud/watsonx-ai SDK
       ↓
IBM Granite model generates structured fitness response
       ↓
Response returned to frontend as formatted markdown
```

### Fallback Flow (No IBM Credentials / API Error)

```
IBM connection fails or credentials missing
       ↓
mock-granite.service.js activates automatically
       ↓
Intent classified: workout / diet / motivation / recovery / bmi
       ↓
Pre-built intelligent response generated
(still personalized using user profile data)
       ↓
Identical response format returned to frontend
```

### Console Indicators
```
[FitnessAI] Connected ✓  region: https://eu-de.ml.cloud.ibm.com  model: ibm/granite-3-1-8b-base
→ IBM Granite is active

[FitnessAI] Credentials missing — using mock mode
→ Running with intelligent mock service
```

---

## 🛡️ Safety System Demo

Try these phrases to see safety guardrails in action:

| Input | Expected Response |
|---|---|
| "I want to lose 10kg in one week" | ⚠️ Safety warning about extreme weight loss |
| "I'll eat only 500 calories per day" | ⚠️ Starvation diet warning |
| "I want to train 7 days every week" | ⚠️ Overtraining syndrome warning |

Each safety response explains the health risk and offers a safe, science-backed alternative.

---

## 📊 Data Storage

All user data is stored in **browser localStorage** — no database required:

| Key | Data |
|---|---|
| `userProfile` | Age, gender, height, weight, goals, fitness level |
| `chatHistory` | All AI conversations |
| `workoutLogs` | Workout sessions with timestamps |
| `calorieLog` | Daily food diary entries |
| `weeklyPlan` | Current 7-day agent plan |
| `achievements` | Earned badges and streak data |

> 💡 This means data is private, works offline, and requires no server-side database.

---

## 🚢 IBM Cloud Deployment

The project includes `manifest.yml` for IBM Cloud Foundry deployment:

```yaml
applications:
  - name: fitness-buddy
    memory: 256M
    instances: 1
    buildpack: nodejs_buildpack
    env:
      IBM_API_KEY: ((IBM_API_KEY))
      WATSONX_PROJECT_ID: ((WATSONX_PROJECT_ID))
      WATSONX_SERVICE_URL: https://eu-de.ml.cloud.ibm.com
```

```bash
# Deploy to IBM Cloud
ibmcloud login --sso
ibmcloud target -o YOUR_ORG -s dev
ibmcloud cf push
```

---

## 🔑 Key Technical Decisions

| Decision | Rationale |
|---|---|
| Vanilla JS (no React) | Zero build complexity, faster load time, easier for demos |
| localStorage (no DB) | No backend DB needed — IBM Lite tier compatible |
| Mock fallback service | App works for judges even without IBM credentials |
| Multi-region auto-detect | Resilient to IBM regional outages |
| Helmet.js + CORS | Security hardening for production |
| IAM Auth over API keys directly | IBM best practice for WatsonX.ai |

---

## 📬 Project Links

- **GitHub:** https://github.com/mahamadhu036/-Fitness-Buddy
- **IBM WatsonX.ai:** https://www.ibm.com/watsonx
- **IBM Cloud Lite:** https://cloud.ibm.com/registration

---

*Walkthrough generated: July 2026 | Fitness Buddy v1.0 | IBM Granite + WatsonX.ai*

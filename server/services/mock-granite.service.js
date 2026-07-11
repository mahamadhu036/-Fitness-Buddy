'use strict';

/**
 * Intelligent Mock Fitness Coach Service — v2
 * Fully structured responses: 🏋️ Workout / 🥗 Diet / 💧 Water / 😴 Recovery / ⚠️ Safety / 🎯 Goal / 💡 Why
 * Personalized using user profile. Safety checks for harmful requests.
 */

// ── Safety Detection ─────────────────────────────────────────────────────────
const UNSAFE_PATTERNS = [
  { pattern: /lose\s+(10|[1-9][0-9]+)\s*kg?\s+in\s+(a\s+|one\s+)?week/i,   warnType: 'extreme_loss' },
  { pattern: /lose\s+\d+\s*kg?\s+in\s+[1-3]\s+days?/i,                     warnType: 'extreme_loss' },
  { pattern: /1000\s*cal(orie)?|500\s*cal(orie)?\s+per\s+day/i,             warnType: 'starvation' },
  { pattern: /skip\s+(eating|meals?|food)\s+(for|all)/i,                    warnType: 'starvation' },
  { pattern: /train\s+(6|7)\s+days?\s+(in\s+a\s+row|per\s+week|every\s+day)/i, warnType: 'overtraining' },
  { pattern: /work(out)?\s+twice\s+a\s+day\s+every\s+day/i,                warnType: 'overtraining' },
];

function checkSafety(message) {
  for (const { pattern, warnType } of UNSAFE_PATTERNS) {
    if (pattern.test(message)) return warnType;
  }
  return null;
}

const SAFETY_RESPONSES = {
  extreme_loss: (profile) => `## ⚠️ Safety Warning — This Goal Is Risky

Hey${profile.name ? ' ' + profile.name : ''}! I care about your health, so I need to be honest with you.

> **Losing large amounts of weight in just days or a week is medically unsafe and nearly impossible through healthy means.**

Extreme rapid weight loss causes:
- 🦴 **Muscle loss** — your body cannibalizes muscle, not fat
- 💔 **Heart strain** — electrolyte imbalances can trigger arrhythmia
- 🧠 **Cognitive impairment** — brain fog, dizziness, fainting
- 📉 **Metabolic damage** — your metabolism slows drastically

---

## 🎯 Safe & Realistic Goal

A healthy rate is **0.5–1 kg per week** — here's what that looks like:

| Timeline | Realistic Target |
|---|---|
| 1 week | 0.5–1 kg |
| 1 month | 2–4 kg |
| 3 months | 6–12 kg |
| 6 months | 12–20 kg |

---

## 🏋️ What I Recommend Instead

A **300–500 kcal daily deficit** through diet + exercise:
- Strength training 3×/week to preserve muscle
- 8,000–10,000 steps daily
- High protein intake (1.6g per kg body weight)

## 💡 Why This Works

Gradual weight loss preserves muscle, keeps your metabolism healthy, and is far more likely to **stay off permanently**.

> 💚 *"This application provides general fitness guidance. Always consult a healthcare professional before starting any weight loss programme."*`,

  starvation: (profile) => `## ⚠️ Safety Warning — Extreme Calorie Restriction

${profile.name ? profile.name + ', t' : 'T'}his approach is dangerous. Eating fewer than 1,200 kcal/day (women) or 1,500 kcal/day (men) without medical supervision causes serious harm.

**What happens when you severely restrict calories:**
- 🔥 **Metabolism crashes** — your body enters "starvation mode"
- 💪 **Muscle loss** — protein is burned for energy
- 🦴 **Bone density loss** — calcium deprivation
- 🧠 **Hormonal disruption** — cortisol spikes, thyroid damage

---

## 🥗 Healthy Approach

A sustainable deficit is **300–500 kcal below your TDEE**:
${profile.tdee ? `Your TDEE: ~${profile.tdee} kcal → Target: ${profile.tdee - 400} kcal/day` : 'Calculate your TDEE in the profile section for a personalised target'}

**Focus on food quality, not just quantity:**
- High-volume, low-calorie foods (vegetables, lean protein)
- 1.8–2.2g protein per kg body weight
- Fibre-rich carbs for satiety

> 💚 *"Please consult a registered dietitian for medically supervised calorie restriction."*`,

  overtraining: (profile) => `## ⚠️ Safety Warning — Overtraining Risk

Training every single day without rest leads to **Overtraining Syndrome (OTS)** — a real medical condition.

**Signs of overtraining:**
- Persistent muscle soreness > 72 hours
- Declining performance despite more training
- Disrupted sleep, mood swings, irritability
- Increased injury rate

---

## 😴 The Optimal Training Schedule

| Level | Training Days | Rest Days |
|---|---|---|
| Beginner | 3 days/week | 4 days |
| Intermediate | 4–5 days/week | 2–3 days |
| Advanced | 5–6 days/week | 1–2 days |

**Active recovery** on rest days: walking, yoga, light stretching — not complete inactivity.

## 💡 Why Rest is the Secret Weapon

Muscles **grow during recovery, not during training**. Rest days trigger protein synthesis, repair micro-tears, and replenish glycogen. Skipping rest = skipping gains.

> 💚 *"Your body needs rest to get stronger. More is not always better."*`,
};

// ── Workout Templates ─────────────────────────────────────────────────────────
function buildWorkoutResponse(level, type, profile) {
  const name = profile.name ? `, ${profile.name}` : '';
  const goal = profile.goals || 'general fitness';
  const equipment = profile.equipment || 'no equipment';
  const weight = profile.weight ? `${profile.weight}kg` : '';

  const workouts = {
    beginner: {
      home: { exercises: [
        { name: 'Bodyweight Squats',    sets: 3, reps: '12–15', rest: '45s', muscles: 'Quads, Glutes, Hamstrings' },
        { name: 'Knee Push-Ups',        sets: 3, reps: '8–12',  rest: '45s', muscles: 'Chest, Shoulders, Triceps' },
        { name: 'Glute Bridges',        sets: 3, reps: '15',    rest: '30s', muscles: 'Glutes, Lower Back' },
        { name: 'Plank Hold',           sets: 3, reps: '20–30s',rest: '30s', muscles: 'Core, Shoulders' },
        { name: 'Mountain Climbers',    sets: 3, reps: '20',    rest: '45s', muscles: 'Core, Hip Flexors, Cardio' },
      ], cal: '180–220', duration: 30 },
      cardio: { exercises: [
        { name: 'Brisk Walk / March in Place', sets: 1, reps: '5 min',  rest: '—',   muscles: 'Full Body, Cardio' },
        { name: 'High Knees',                  sets: 4, reps: '30s',    rest: '30s', muscles: 'Core, Hip Flexors' },
        { name: 'Jumping Jacks',               sets: 4, reps: '40',     rest: '30s', muscles: 'Full Body' },
        { name: 'Step Touches',                sets: 4, reps: '1 min',  rest: '20s', muscles: 'Cardio, Coordination' },
        { name: 'Cool-Down Walk',              sets: 1, reps: '3 min',  rest: '—',   muscles: 'Recovery' },
      ], cal: '200–280', duration: 25 },
      strength: { exercises: [
        { name: 'Goblet Squats (water bottle)', sets: 3, reps: '12',  rest: '60s', muscles: 'Quads, Glutes' },
        { name: 'Push-Ups',                     sets: 3, reps: '10',  rest: '60s', muscles: 'Chest, Triceps' },
        { name: 'Dumbbell Rows (if available)', sets: 3, reps: '10',  rest: '60s', muscles: 'Back, Biceps' },
        { name: 'Hip Hinge (RDL)',              sets: 3, reps: '12',  rest: '60s', muscles: 'Hamstrings, Glutes' },
        { name: 'Overhead Press',               sets: 3, reps: '10',  rest: '60s', muscles: 'Shoulders, Triceps' },
      ], cal: '210–260', duration: 35 },
      hiit: { exercises: [
        { name: 'Jump Squats',         sets: 4, reps: '30s on/30s off', rest: '15s', muscles: 'Legs, Cardio' },
        { name: 'Push-Up Burpees',     sets: 4, reps: '30s on/30s off', rest: '15s', muscles: 'Full Body' },
        { name: 'High Knees',          sets: 4, reps: '30s on/30s off', rest: '15s', muscles: 'Core, Cardio' },
        { name: 'Lateral Shuffles',    sets: 4, reps: '30s on/30s off', rest: '15s', muscles: 'Legs, Agility' },
      ], cal: '250–350', duration: 20 },
      yoga: { exercises: [
        { name: 'Child\'s Pose',         sets: 1, reps: '60s',  rest: '—', muscles: 'Back, Hips' },
        { name: 'Cat-Cow Stretches',     sets: 1, reps: '10',   rest: '—', muscles: 'Spine, Core' },
        { name: 'Downward Dog',          sets: 3, reps: '30s',  rest: '—', muscles: 'Hamstrings, Shoulders' },
        { name: 'Warrior I',             sets: 2, reps: '45s each side', rest: '—', muscles: 'Hips, Legs' },
        { name: 'Seated Forward Fold',   sets: 1, reps: '60s',  rest: '—', muscles: 'Hamstrings, Lower Back' },
      ], cal: '100–140', duration: 25 },
    },
    intermediate: {
      home: { exercises: [
        { name: 'Jump Squats',             sets: 4, reps: '15',    rest: '40s', muscles: 'Quads, Glutes, Cardio' },
        { name: 'Push-Up to T-Rotation',   sets: 4, reps: '10',    rest: '40s', muscles: 'Chest, Core, Obliques' },
        { name: 'Reverse Lunges',          sets: 4, reps: '12/leg',rest: '40s', muscles: 'Quads, Glutes, Balance' },
        { name: 'Burpees',                 sets: 4, reps: '10',    rest: '50s', muscles: 'Full Body' },
        { name: 'Bicycle Crunches',        sets: 3, reps: '20',    rest: '30s', muscles: 'Core, Obliques' },
        { name: 'Lateral Bounds',          sets: 3, reps: '12/side',rest:'40s', muscles: 'Legs, Agility' },
      ], cal: '350–450', duration: 40 },
      strength: { exercises: [
        { name: 'Dumbbell Chest Press',    sets: 4, reps: '10',    rest: '75s', muscles: 'Chest, Triceps' },
        { name: 'Bent-Over Rows',          sets: 4, reps: '10',    rest: '75s', muscles: 'Back, Biceps' },
        { name: 'Romanian Deadlifts',      sets: 4, reps: '12',    rest: '75s', muscles: 'Hamstrings, Glutes' },
        { name: 'Goblet Squats',           sets: 4, reps: '12',    rest: '75s', muscles: 'Quads, Core' },
        { name: 'Overhead Dumbbell Press', sets: 3, reps: '10',    rest: '60s', muscles: 'Shoulders, Triceps' },
        { name: 'Plank w/ Shoulder Taps',  sets: 3, reps: '20',    rest: '40s', muscles: 'Core, Stability' },
      ], cal: '300–400', duration: 45 },
      cardio: { exercises: [
        { name: 'Warm-up Jog',             sets: 1, reps: '5 min',  rest: '—',  muscles: 'Cardio' },
        { name: '400m Run / Fast Jog',     sets: 4, reps: '400m',   rest: '90s',muscles: 'Full Body Cardio' },
        { name: 'Box Step-Ups',            sets: 3, reps: '15/leg', rest: '45s',muscles: 'Glutes, Quads' },
        { name: 'Jump Rope / Simulation',  sets: 3, reps: '1 min',  rest: '30s',muscles: 'Cardio, Coordination' },
      ], cal: '380–480', duration: 40 },
      hiit: { exercises: [
        { name: 'Plyometric Push-Ups',     sets: 4, reps: '40s/20s', rest: '—', muscles: 'Chest, Power' },
        { name: 'Jump Lunges',             sets: 4, reps: '40s/20s', rest: '—', muscles: 'Legs, Cardio' },
        { name: 'Mountain Climbers',       sets: 4, reps: '40s/20s', rest: '—', muscles: 'Core, Cardio' },
        { name: 'Burpee to Box Jump',      sets: 4, reps: '40s/20s', rest: '—', muscles: 'Full Body, Power' },
        { name: 'Speed Skaters',           sets: 4, reps: '40s/20s', rest: '—', muscles: 'Legs, Agility' },
      ], cal: '430–550', duration: 30 },
      yoga: { exercises: [
        { name: 'Sun Salutation A',        sets: 5, reps: '1 flow',  rest: '15s', muscles: 'Full Body' },
        { name: 'Warrior II to Triangle',  sets: 3, reps: '45s/side',rest: '—',   muscles: 'Hips, Legs' },
        { name: 'Chaturanga Hold',         sets: 3, reps: '15s',     rest: '—',   muscles: 'Arms, Core' },
        { name: 'Pigeon Pose',             sets: 2, reps: '60s/side',rest: '—',   muscles: 'Hip Flexors, Glutes' },
      ], cal: '150–200', duration: 40 },
    },
    advanced: {
      home: { exercises: [
        { name: 'Plyometric Push-Ups',     sets: 5, reps: '10',    rest: '30s', muscles: 'Chest, Power, Triceps' },
        { name: 'Pistol Squats',           sets: 5, reps: '6/leg', rest: '45s', muscles: 'Quads, Glutes, Balance' },
        { name: 'Handstand Hold (wall)',   sets: 3, reps: '30s',   rest: '30s', muscles: 'Shoulders, Core' },
        { name: 'Dragon Flags',            sets: 4, reps: '6',     rest: '60s', muscles: 'Core, Hip Flexors' },
        { name: 'Jump Lunges',             sets: 4, reps: '20',    rest: '30s', muscles: 'Legs, Power' },
        { name: 'L-Sit Hold',             sets: 3, reps: '15s',   rest: '45s', muscles: 'Core, Triceps' },
      ], cal: '500–600', duration: 50 },
      strength: { exercises: [
        { name: 'Heavy Dumbbell Press',    sets: 5, reps: '5',     rest: '90s', muscles: 'Chest, Power' },
        { name: 'Single-Arm DB Row',       sets: 4, reps: '8/arm', rest: '75s', muscles: 'Back, Core Stability' },
        { name: 'Bulgarian Split Squats',  sets: 4, reps: '10/leg',rest: '90s', muscles: 'Quads, Glutes' },
        { name: 'DB Romanian Deadlift',    sets: 4, reps: '8',     rest: '90s', muscles: 'Hamstrings, Glutes' },
        { name: 'Arnold Press',            sets: 4, reps: '10',    rest: '75s', muscles: 'Full Shoulder Complex' },
        { name: 'Weighted Plank',          sets: 3, reps: '45s',   rest: '30s', muscles: 'Core' },
      ], cal: '420–550', duration: 55 },
      hiit: { exercises: [
        { name: 'Assault Bike / Sprints',  sets: 8, reps: '20s max/10s rest', rest: '—', muscles: 'Full Body' },
        { name: 'Plyometric Burpees',      sets: 5, reps: '10',               rest: '30s',muscles: 'Full Body, Power' },
        { name: 'Box Jumps',               sets: 5, reps: '8',                rest: '40s',muscles: 'Legs, Power' },
        { name: 'Bear Crawl',              sets: 4, reps: '20m',              rest: '30s',muscles: 'Full Body, Core' },
      ], cal: '550–700', duration: 35 },
      cardio: { exercises: [
        { name: 'Interval Runs (400m @ 85%)', sets: 6, reps: '400m',  rest: '60s', muscles: 'Full Body Cardio' },
        { name: 'Sprint Drills',               sets: 4, reps: '60m',   rest: '45s', muscles: 'Power, Speed' },
        { name: 'Jump Rope',                   sets: 3, reps: '2 min', rest: '30s', muscles: 'Coordination, Cardio' },
      ], cal: '500–650', duration: 45 },
      yoga: { exercises: [
        { name: 'Full Sun Salutation B',   sets: 6, reps: '1 flow',  rest: '—',   muscles: 'Full Body' },
        { name: 'Crow Pose',               sets: 3, reps: '20s hold',rest: '30s', muscles: 'Arms, Core Balance' },
        { name: 'Wheel Pose (Urdhva)',     sets: 3, reps: '30s hold',rest: '—',   muscles: 'Spine, Shoulders, Hip Flexors' },
        { name: 'One-Leg King Pigeon',     sets: 2, reps: '60s/side',rest: '—',   muscles: 'Deep Hip Flexors' },
      ], cal: '200–280', duration: 50 },
    },
  };

  const lvl = workouts[level] || workouts.beginner;
  const workout = lvl[type] || lvl.home;

  const exerciseTable = workout.exercises.map(ex => `
| ${ex.name} | ${ex.sets} sets | ${ex.reps} | ${ex.rest} | ${ex.muscles} |`).join('');

  const dailyWater = profile.weight ? `${Math.round(profile.weight * 0.035 * 10) / 10}L` : '2.5–3L';
  const bmiNote = profile.bmi ? `Your BMI: **${profile.bmi}** (${profile.bmiCategory})` : '';

  return `## 🏋️ Your ${level.charAt(0).toUpperCase() + level.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)} Workout${name}

**⏱ Duration:** ${workout.duration} min &nbsp;|&nbsp; **🔥 Calories:** ~${workout.cal} kcal &nbsp;|&nbsp; **🎯 Goal:** ${goal}
${bmiNote ? `**📊 ${bmiNote}**` : ''}

---

### Warm-Up (5 min)
- Arm circles × 30 sec
- Leg swings × 30 sec each side
- Light jog in place × 2 min
- Dynamic hip circles × 1 min

### Main Circuit

| Exercise | Sets | Reps / Duration | Rest | Muscles Targeted |
|---|---|---|---|---|${exerciseTable}

### Cool-Down (5 min)
- Standing quad stretch × 45s each
- Seated hamstring stretch × 60s
- Child's pose × 60s
- Deep breathing × 1 min

---

## 🥗 Nutrition for This Workout

${goal === 'weight loss'
? `**Pre-workout (30–60 min before):** Banana + 10 almonds (~200 kcal)
**Post-workout (within 30 min):** Greek yogurt + berries + protein shake (~350 kcal)
**Daily protein target:** ${profile.weight ? Math.round(profile.weight * 1.8) + 'g' : '120–150g'}`
: `**Pre-workout (30–60 min before):** Oats + banana + honey (~350 kcal)
**Post-workout (within 30 min):** Protein shake + rice cakes (~400 kcal)
**Daily protein target:** ${profile.weight ? Math.round(profile.weight * 2.0) + 'g' : '150–180g'}`}

---

## 💧 Water Intake

| Timing | Amount |
|---|---|
| Pre-workout | 400ml (30 min before) |
| During workout | 200ml every 20 min |
| Post-workout | 500ml immediately |
| **Daily total** | **${dailyWater}** |

---

## 😴 Recovery

- **Rest:** 7–9 hours of sleep for muscle repair
- **Active recovery:** Light walk or 10-min stretch tomorrow
- **Foam roll** the muscles you worked today for 2–3 min

---

## ⚠️ Safety Tips

- **Warm up every time** — cold muscles tear more easily
- Stop if you feel sharp pain (not regular muscle burn)
- Keep your ${type === 'strength' || type === 'hiit' ? 'back neutral — never round under load' : 'core engaged throughout all movements'}
- ${level === 'beginner' ? 'It\'s OK to rest longer between sets — listen to your body' : 'Push intensity, but not at the cost of form'}

---

## 🎯 Today's Goal

Complete all ${workout.exercises.length} exercises with proper form. Log this workout in the Workout tab when done!

---

## 💡 Why This Works

This ${type} routine was chosen because ${
  goal === 'weight loss' ? `it maximises calorie burn while preserving muscle. ${type === 'hiit' ? 'HIIT creates an "afterburn" effect (EPOC) that keeps burning calories for up to 24 hours post-workout' : 'Compound movements recruit multiple muscle groups simultaneously, burning more energy per rep'}` :
  goal === 'muscle gain' ? `compound movements with progressive overload stimulate maximum muscle protein synthesis. Your ${equipment} allows for sufficient resistance to trigger hypertrophy` :
  `it builds cardiovascular endurance and overall functional fitness — perfect for your ${goal} goal`
}.

> 💚 *"This application provides general fitness guidance and is not a substitute for professional medical advice. Consult your doctor before starting a new exercise programme."*`;
}

// ── Meal Templates ────────────────────────────────────────────────────────────
function buildMealResponse(goal, profile) {
  const name = profile.name ? `, ${profile.name}` : '';
  const diet = profile.diet || 'no preference';
  const kcal = profile.tdee ? Math.round(profile.tdee + (goal === 'muscle gain' ? 300 : goal === 'weight loss' ? -400 : 0)) : 2000;
  const protein = profile.weight ? Math.round(profile.weight * (goal === 'muscle gain' ? 2.0 : 1.8)) : 150;
  const water = profile.weight ? `${Math.round(profile.weight * 0.035 * 10) / 10}L` : '2.5L';

  const mealPlans = {
    'weight loss': {
      breakfast: { desc: 'Greek yogurt (150g) + mixed berries + 1 tbsp chia seeds', kcal: 350, p: 20, c: 35, f: 8 },
      lunch:     { desc: 'Grilled chicken breast (150g) + large salad + ½ cup quinoa + lemon-tahini dressing', kcal: 450, p: 40, c: 38, f: 12 },
      snack:     { desc: '1 apple + 10 almonds', kcal: 150, p: 3, c: 22, f: 8 },
      dinner:    { desc: 'Baked salmon (130g) + steamed broccoli + cauliflower rice', kcal: 400, p: 32, c: 18, f: 14 },
    },
    'muscle gain': {
      breakfast: { desc: '4-egg omelette with spinach + 2 slices whole-grain toast + 1 banana + protein shake', kcal: 700, p: 45, c: 65, f: 18 },
      lunch:     { desc: '200g chicken breast + 1.5 cups brown rice + roasted sweet potato + mixed veg', kcal: 800, p: 55, c: 85, f: 12 },
      snack:     { desc: 'Protein shake (1 scoop) + rice cakes (3) + 2 tbsp peanut butter', kcal: 400, p: 35, c: 38, f: 14 },
      dinner:    { desc: '200g steak/salmon + 1.5 cups pasta + broccoli + olive oil drizzle', kcal: 800, p: 52, c: 82, f: 22 },
    },
    'vegetarian': {
      breakfast: { desc: 'Overnight oats + almond milk + protein powder + berries', kcal: 420, p: 28, c: 55, f: 10 },
      lunch:     { desc: 'Lentil-chickpea curry + basmati rice + cucumber raita', kcal: 500, p: 24, c: 70, f: 10 },
      snack:     { desc: 'Hummus + carrot sticks + whole grain crackers', kcal: 200, p: 8, c: 28, f: 7 },
      dinner:    { desc: 'Tofu stir-fry + bell peppers + broccoli + edamame + brown rice', kcal: 550, p: 30, c: 65, f: 14 },
    },
    default: {
      breakfast: { desc: 'Oats + banana + almond butter + black coffee', kcal: 420, p: 14, c: 58, f: 14 },
      lunch:     { desc: 'Quinoa bowl + chickpeas + roasted vegetables + tahini', kcal: 480, p: 22, c: 65, f: 15 },
      snack:     { desc: 'Protein bar or Greek yogurt + nuts', kcal: 200, p: 15, c: 20, f: 8 },
      dinner:    { desc: 'Grilled fish/chicken + steamed vegetables + small serving of rice', kcal: 480, p: 38, c: 42, f: 12 },
    },
  };

  const plan = diet === 'vegetarian' || diet === 'vegan' ? mealPlans.vegetarian
    : goal === 'muscle gain' ? mealPlans['muscle gain']
    : goal === 'weight loss' ? mealPlans['weight loss']
    : mealPlans.default;

  const totalKcal = plan.breakfast.kcal + plan.lunch.kcal + plan.snack.kcal + plan.dinner.kcal;
  const totalP = plan.breakfast.p + plan.lunch.p + plan.snack.p + plan.dinner.p;

  return `## 🥗 Personalised ${goal.charAt(0).toUpperCase() + goal.slice(1)} Meal Plan${name}

**🎯 Daily Target:** ~${kcal} kcal &nbsp;|&nbsp; **💪 Protein:** ${protein}g &nbsp;|&nbsp; **Diet:** ${diet}

---

| Meal | Food | Kcal | Protein |
|---|---|---|---|
| 🌅 Breakfast | ${plan.breakfast.desc} | ${plan.breakfast.kcal} | ${plan.breakfast.p}g |
| ☀️ Lunch | ${plan.lunch.desc} | ${plan.lunch.kcal} | ${plan.lunch.p}g |
| 🍎 Snack | ${plan.snack.desc} | ${plan.snack.kcal} | ${plan.snack.p}g |
| 🌙 Dinner | ${plan.dinner.desc} | ${plan.dinner.kcal} | ${plan.dinner.p}g |
| **TOTAL** | | **${totalKcal} kcal** | **${totalP}g** |

---

## 💧 Water Intake

Drink **${water}** today. Schedule:
- Wake up: 500ml (before anything else!)
- Mid-morning: 300ml
- With lunch: 400ml
- Pre-workout: 400ml
- Evening: remaining

---

## 😴 Recovery & Sleep

- Aim for **7–9 hours** of quality sleep
- Avoid heavy meals within 2 hours of bedtime
- A casein-rich snack (cottage cheese, Greek yogurt) before bed supports overnight muscle repair

---

## ⚠️ Safety Tips

- **Don't skip breakfast** — it regulates hunger hormones all day
- Avoid ultra-processed foods more than 20% of your total intake
- If you feel lightheaded or fatigued, increase calorie intake by 150–200 kcal
- ${goal === 'weight loss' ? 'Never go below 1,200 kcal/day (women) or 1,500 kcal/day (men) without medical supervision' : 'Spreading protein across 4+ meals maximises muscle protein synthesis'}

---

## 🎯 Today's Nutrition Goal

Hit your **${protein}g protein target** and drink **${water}** of water!

---

## 💡 Why This Works

This meal plan ${
  goal === 'weight loss' ? 'creates a moderate caloric deficit while keeping protein high to preserve muscle. High-volume, low-calorie foods like vegetables and Greek yogurt keep you full without excess calories' :
  goal === 'muscle gain' ? 'provides a calorie surplus with strategic protein timing to fuel muscle protein synthesis. The carbohydrate timing around workouts replenishes glycogen and supports performance' :
  'balances all macronutrients to fuel daily activities, support recovery, and maintain overall health and energy'
}.

> 💚 *"This application provides general fitness guidance and is not a substitute for professional medical or dietary advice."*`;
}

// ── Other Response Types ──────────────────────────────────────────────────────
const RESPONSES = {
  motivation: (profile) => {
    const name = profile.name ? profile.name : 'champion';
    const quotes = [
      { q: 'The only bad workout is the one that didn\'t happen.', a: 'Unknown' },
      { q: 'Strength doesn\'t come from what you can do. It comes from overcoming the things you once thought you couldn\'t.', a: 'Rikki Rogers' },
      { q: 'Every step forward is a step in the right direction.', a: 'Fitness Buddy AI' },
      { q: 'Your body can stand almost anything. It\'s your mind you have to convince.', a: 'Unknown' },
    ];
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    return `## 💪 Your Daily Boost, ${name}!

> *"${q.q}"*
> — ${q.a}

---

## 🏋️ Today's 10-Minute Starter

Don't feel like a full session? Start with just this:

| Exercise | Reps |
|---|---|
| Jumping Jacks | 30 |
| Push-Ups | 10 |
| Squats | 15 |
| Plank Hold | 30s |

Once you begin, **momentum takes over.** 🚀

---

## 🥗 Fuel Your Motivation

Low motivation often means low blood sugar. Eat a balanced snack:
- Banana + peanut butter
- Greek yogurt + granola
- Handful of mixed nuts

---

## 💧 Hydration Check

Even 2% dehydration reduces energy and mood by up to 20%. Drink a big glass of water **right now**.

---

## 😴 If You're Exhausted

Fatigue is your body talking. Consider:
- An extra 30–60 min of sleep tonight
- A gentle 20-min yoga or walk instead of intense training
- Checking your iron, vitamin D, and B12 levels

---

## ⚠️ Safety First

Never train through pain. Discomfort = OK. Sharp pain = Stop.

---

## 🎯 Your Goal Today

Do **something** — even if it's a 10-minute walk. Showing up consistently beats intensity every time.

---

## 💡 Why Consistency Beats Perfection

Research shows that people who exercise consistently at moderate intensity lose **more fat and build more muscle** over 12 months than those who go hard occasionally. The habit IS the workout.`;
  },

  recovery: (profile) => `## 😴 Recovery & Rest Day Guide

Great question${profile.name ? ', ' + profile.name : ''}! Recovery is where the **real gains happen**.

---

## 🏋️ Active Recovery (choose one)

| Activity | Duration | Intensity |
|---|---|---|
| Gentle walk | 20–30 min | Very easy |
| Yoga flow | 20 min | Light |
| Light swimming | 20 min | Easy |
| Foam rolling | 15 min | Therapeutic |

---

## 🥗 Nutrition on Rest Days

- Keep **protein high** (1.6–2g/kg) — muscle repair continues on rest days
- Slightly **reduce carbs** by 50–100g (less fuel needed)
- Load up on **anti-inflammatory foods**: berries, turmeric, fatty fish, leafy greens

---

## 💧 Hydration

Still drink **${profile.weight ? Math.round(profile.weight * 0.035 * 10) / 10 + 'L' : '2.5L'}** today — hydration supports cellular repair even without exercise.

---

## ⚠️ Signs You NEED a Rest Day

- Persistent soreness lasting > 72 hours
- Declining performance — lifting less, running slower
- Disrupted sleep despite being tired
- Irritability, mood changes

---

## 🎯 Today's Goal

Sleep 7–9 hours, foam roll your tightest muscles, and eat a protein-rich dinner.

---

## 💡 Why Recovery Works

During rest, your body releases **growth hormone (GH)** — peaking 1–3 hours into sleep. This hormone drives muscle repair, fat burning, and tissue regeneration. Skipping rest = skipping the most anabolic part of training.`,

  hydration: (profile) => {
    const daily = profile.weight ? `${Math.round(profile.weight * 0.035 * 10) / 10}L` : '2.5–3L';
    return `## 💧 Personalised Hydration Guide${profile.name ? ' for ' + profile.name : ''}

**Your daily water target: ${daily}**
${profile.weight ? `_(Based on your weight: ${profile.weight}kg × 35ml = ${Math.round(profile.weight * 35)}ml/day)_` : ''}

---

## 🏋️ Workout Hydration Schedule

| Time | Amount |
|---|---|
| Wake up | 500ml (immediately!) |
| Pre-workout (30 min before) | 400ml |
| During workout (every 20 min) | 150–200ml |
| Post-workout | 500ml |
| Throughout the day | Sip remaining amount |

---

## 🥗 Hydrating Foods

Boost hydration through food too:
- 🥒 Cucumber (96% water)
- 🍉 Watermelon (92% water)  
- 🥬 Leafy greens (90% water)
- 🍓 Strawberries (91% water)

---

## ⚠️ Signs of Dehydration

- Dark yellow urine (target: pale yellow)
- Performance drops > 10% with just 2% dehydration
- Muscle cramps, headaches, fatigue

---

## 🎯 Today's Goal

Track your glasses in the Dashboard water tracker. Hit ${daily}!

---

## 💡 Why Hydration Matters for Fitness

Muscles are **75% water**. Even slight dehydration reduces strength output, increases perceived effort, slows recovery, and impairs fat metabolism.`;
  },

  goals: (profile) => `## 🎯 Goal Setting for ${profile.name || 'Your Fitness Journey'}

${profile.goals ? `Your current goal: **${profile.goals}** — let's build a roadmap!` : 'Let\'s set some powerful, achievable goals.'}

---

## 🏋️ SMART Fitness Goals

| Letter | Meaning | Your Example |
|---|---|---|
| S | Specific | "${profile.goals === 'weight loss' ? 'Lose 5kg by building a 400kcal daily deficit' : profile.goals === 'muscle gain' ? 'Add 5kg of lean muscle in 16 weeks' : 'Run 5km without stopping in 8 weeks'}" |
| M | Measurable | Track weekly on the Dashboard |
| A | Achievable | Based on your ${profile.fitnessLevel || 'current'} fitness level |
| R | Relevant | Aligned with your life and schedule |
| T | Time-bound | Set a 12-week deadline |

---

## 📅 12-Week Milestone Plan

| Week | Focus | Target |
|---|---|---|
| 1–2 | Build habits | 3 workouts, meal logging |
| 3–4 | Increase intensity | 4 workouts, hit calorie goals |
| 5–8 | Progressive overload | Heavier/harder each week |
| 9–12 | Peak performance | Maximum consistency |

---

## 🥗 Nutrition Goal

Protein target: **${profile.weight ? Math.round(profile.weight * 1.8) + 'g/day' : '1.6–2g per kg body weight'}**

---

## 💧 Daily Habit Goals

- 💧 Drink ${profile.weight ? Math.round(profile.weight * 0.035 * 10) / 10 + 'L' : '2.5L'} water
- 😴 Sleep 7–9 hours
- 🚶 8,000–10,000 steps

---

## ⚠️ Safety Reminder

Avoid setting goals that require extreme calorie restriction or daily intense training — these backfire 90% of the time.

---

## 💡 Why Goal-Setting Works

Writing down a goal makes you **42% more likely to achieve it** (Dr. Gail Matthews, Dominican University). The Dashboard tracks your streaks, workouts, and progress automatically!`,

  bmi: (profile) => {
    if (!profile.bmi) {
      return `## 📊 BMI & Calorie Calculator

To get your personalised BMI and calorie needs, please fill in your profile:
1. Click the **👤 Profile** button in the top right
2. Enter your **age, gender, height, and weight**
3. Buddy will instantly calculate your BMI and TDEE

---

## 📊 BMI Reference

| BMI Range | Category |
|---|---|
| Below 18.5 | Underweight |
| 18.5 – 24.9 | Normal weight ✅ |
| 25.0 – 29.9 | Overweight |
| 30.0+ | Obese |

> 💡 BMI is a screening tool, not a complete health measure. Muscle mass, bone density, and body composition also matter.`;
    }
    return `## 📊 Your Personal BMI & Calorie Analysis${profile.name ? ' — ' + profile.name : ''}

---

### Your Numbers

| Metric | Value | Category |
|---|---|---|
| Height | ${profile.height}cm | — |
| Weight | ${profile.weight}kg | — |
| **BMI** | **${profile.bmi}** | **${profile.bmiCategory}** |
| Age | ${profile.age} years | — |
| **TDEE** | **~${profile.tdee} kcal/day** | Maintenance |

---

### 🎯 Calorie Targets Based on Your Goal

| Goal | Daily Calories |
|---|---|
| Aggressive fat loss | ${profile.tdee - 600} kcal |
| Moderate fat loss ✅ | ${profile.tdee - 400} kcal |
| Maintenance | ${profile.tdee} kcal |
| Lean bulk | ${profile.tdee + 300} kcal |
| Aggressive bulk | ${profile.tdee + 500} kcal |

**Recommended for "${profile.goals || 'general fitness'}":** ${
  profile.goals === 'weight loss' ? `**${profile.tdee - 400} kcal/day**` :
  profile.goals === 'muscle gain' ? `**${profile.tdee + 300} kcal/day**` :
  `**${profile.tdee} kcal/day**`
}

---

## 🥗 Macronutrient Targets

| Macro | Amount | Calories |
|---|---|---|
| Protein | ${Math.round(profile.weight * 1.8)}g | ${Math.round(profile.weight * 1.8 * 4)} kcal |
| Carbs | ${Math.round((profile.tdee * 0.45) / 4)}g | ${Math.round(profile.tdee * 0.45)} kcal |
| Fat | ${Math.round((profile.tdee * 0.25) / 9)}g | ${Math.round(profile.tdee * 0.25)} kcal |

---

## 💧 Daily Water Target

**${Math.round(profile.weight * 35)}ml (${Math.round(profile.weight * 0.035 * 10) / 10}L)** based on your weight

---

## 💡 Understanding Your BMI

Your BMI of **${profile.bmi}** means you're in the **${profile.bmiCategory}** range. ${
  profile.bmiCategory === 'Normal weight' ? 'Great — focus on building strength and maintaining this healthy range.' :
  profile.bmiCategory === 'Overweight' ? 'A modest calorie deficit plus regular strength training is the most effective strategy.' :
  profile.bmiCategory === 'Underweight' ? 'Focus on a calorie surplus with high protein intake to build lean muscle.' :
  'Regular exercise and a moderate deficit are the safest, most effective approaches.'
}

> 💚 *"These are evidence-based estimates. Consult your doctor or dietitian for personalised medical advice."*`;
  },
};

// ── Category Matcher ──────────────────────────────────────────────────────────
function matchCategory(message) {
  const msg = message.toLowerCase();
  if (/bmi|body mass|tdee|calori.*(need|require|target)|how much.*(eat|calori)|daily calori|maintenance calori/.test(msg)) return 'bmi';
  if (/meal|diet|eat|food|nutrition|breakfast|lunch|dinner|snack|protein|carb|macro/.test(msg)) {
    if (/vegetarian|vegan|plant/.test(msg)) return 'meal_vegetarian';
    if (/weight.?loss|cut|slim|lean|lose/.test(msg)) return 'meal_weightloss';
    if (/muscle|bulk|gain|mass/.test(msg)) return 'meal_musclegain';
    return 'meal_default';
  }
  if (/workout|exercise|train|routine|circuit|hiit|cardio|strength|yoga|push.?up|squat/.test(msg)) {
    if (/beginner|start|new|never/.test(msg)) return 'workout_beginner_home';
    if (/intermediate/.test(msg)) return 'workout_intermediate_home';
    if (/advanced/.test(msg)) return 'workout_advanced_home';
    if (/cardio/.test(msg)) return 'workout_beginner_cardio';
    if (/strength|dumbbell|weight/.test(msg)) return 'workout_beginner_strength';
    if (/hiit/.test(msg)) return 'workout_beginner_hiit';
    if (/yoga|stretch|flexibility/.test(msg)) return 'workout_beginner_yoga';
    return 'workout_beginner_home';
  }
  if (/motivat|inspir|quote|tired|lazy|give up|hard|struggle/.test(msg)) return 'motivation';
  if (/recover|rest|sore|sleep|rest.?day|foam/.test(msg)) return 'recovery';
  if (/water|hydrat|drink/.test(msg)) return 'hydration';
  if (/goal|target|plan|objective|aim/.test(msg)) return 'goals';
  return 'motivation';
}

// ── Main Export ───────────────────────────────────────────────────────────────
function mockGraniteResponse(userMessage, context = {}) {
  // Safety check first
  const safetyIssue = checkSafety(userMessage);
  if (safetyIssue && SAFETY_RESPONSES[safetyIssue]) {
    return { text: SAFETY_RESPONSES[safetyIssue](context), model: 'fitness-buddy-safety-v2', usage: 0, source: 'mock' };
  }

  const category = matchCategory(userMessage);

  let text = '';
  switch (category) {
    case 'bmi':               text = RESPONSES.bmi(context); break;
    case 'workout_beginner_home':     text = buildWorkoutResponse('beginner', 'home', context); break;
    case 'workout_beginner_cardio':   text = buildWorkoutResponse('beginner', 'cardio', context); break;
    case 'workout_beginner_strength': text = buildWorkoutResponse('beginner', 'strength', context); break;
    case 'workout_beginner_hiit':     text = buildWorkoutResponse('beginner', 'hiit', context); break;
    case 'workout_beginner_yoga':     text = buildWorkoutResponse('beginner', 'yoga', context); break;
    case 'workout_intermediate_home': text = buildWorkoutResponse('intermediate', context.workoutType || 'home', context); break;
    case 'workout_advanced_home':     text = buildWorkoutResponse('advanced', context.workoutType || 'home', context); break;
    case 'meal_weightloss':   text = buildMealResponse('weight loss', context); break;
    case 'meal_musclegain':   text = buildMealResponse('muscle gain', context); break;
    case 'meal_vegetarian':   text = buildMealResponse('vegetarian', context); break;
    case 'meal_default':      text = buildMealResponse(context.goals || 'general fitness', context); break;
    case 'motivation':        text = RESPONSES.motivation(context); break;
    case 'recovery':          text = RESPONSES.recovery(context); break;
    case 'hydration':         text = RESPONSES.hydration(context); break;
    case 'goals':             text = RESPONSES.goals(context); break;
    default:                  text = RESPONSES.motivation(context);
  }

  // Auto-detect workout type from context
  if (context.workoutType && category.startsWith('workout')) {
    const lvl = context.fitnessLevel || 'beginner';
    text = buildWorkoutResponse(lvl, context.workoutType, context);
  }

  return { text, model: 'fitness-buddy-mock-v2', usage: text.split(' ').length, source: 'mock' };
}

module.exports = { mockGraniteResponse };

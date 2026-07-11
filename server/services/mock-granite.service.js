'use strict';

/**
 * Intelligent Mock Fitness Coach Service
 * Provides rich, keyword-driven responses across all fitness domains
 */

const WORKOUTS = {
  beginner: {
    home: `## 🏠 Beginner Home Workout (30 min)

**Warm-up (5 min)**
- Arm circles × 30 sec
- Leg swings × 30 sec each leg
- March in place × 2 min
- Torso twists × 1 min

**Main Circuit (20 min) — 3 rounds**
| Exercise | Reps/Duration | Rest |
|---|---|---|
| Squats | 12 reps | 30s |
| Push-ups (knee-modified ok) | 8–10 reps | 30s |
| Glute bridges | 15 reps | 30s |
| Plank hold | 20–30 sec | 30s |
| Mountain climbers | 20 reps | 45s |

**Cool-down (5 min)**
- Child's pose × 60 sec
- Hip flexor stretch × 45 sec each
- Cat-cow stretches × 10 reps

> 💡 **Tip:** Rest 60–90 seconds between rounds. Aim for 3× per week with rest days in between.
> 🔥 **Calories burned:** ~180–220 kcal`,

    cardio: `## 💨 Beginner Cardio Blast (25 min)

**5-min Walk/Jog Warm-up**

**20-min Interval Circuit — Repeat 4x**
| Interval | Duration |
|---|---|
| Brisk walk / light jog | 2 min |
| High knees | 30 sec |
| Rest / slow walk | 30 sec |

**Cool-down stretches (5 min)**

> 🔥 **Calories burned:** ~200–280 kcal
> 💡 Increase jog speed each week as fitness improves`,
  },
  intermediate: {
    home: `## 🔥 Intermediate HIIT Home Workout (40 min)

**Warm-up (5 min)** — Jump rope simulation, dynamic stretches

**HIIT Circuit (30 min) — 4 rounds, 40s work / 20s rest**
| Exercise | Target |
|---|---|
| Jump squats | Glutes, quads |
| Push-up to T-rotation | Chest, core |
| Reverse lunges | Legs, balance |
| Burpees | Full body |
| Bicycle crunches | Core |
| Lateral bounds | Agility, glutes |

**Cool-down (5 min)**

> 🔥 **Calories burned:** ~350–450 kcal
> 💪 Track your rounds and try to increase by 1 each week`,

    strength: `## 💪 Intermediate Strength Training (45 min)

**Superset A — Upper Body (3 sets)**
- Dumbbell chest press × 10 + Bent-over rows × 10

**Superset B — Lower Body (3 sets)**
- Romanian deadlifts × 12 + Goblet squats × 12

**Superset C — Core & Shoulders (3 sets)**
- Overhead press × 10 + Plank shoulder taps × 20

**Finisher**
- 3 × 10 dips (chair) + 10 push-ups

> 🔥 **Calories burned:** ~300–400 kcal`,
  },
  advanced: {
    home: `## ⚡ Advanced Bodyweight Power Workout (50 min)

**Dynamic Warm-up (8 min)**

**Power Circuit — 5 rounds, max intensity**
| Exercise | Reps | Rest |
|---|---|---|
| Plyometric push-ups | 10 | 30s |
| Pistol squats (each leg) | 6 | 45s |
| Handstand hold (wall) | 30 sec | 30s |
| Dragon flags | 6 | 60s |
| Jump lunges | 20 | 30s |
| L-sit hold | 15 sec | 45s |

> 🔥 **Calories burned:** ~500–600 kcal
> ⚡ Elite-level movement — prioritize form over speed`,
  },
};

const MEALS = {
  weightloss: `## 🥗 Weight Loss Meal Plan (1,400–1,600 kcal)

**Breakfast (~350 kcal)**
- Greek yogurt (150g) + mixed berries + 1 tbsp chia seeds
- Black coffee or green tea

**Lunch (~450 kcal)**
- Grilled chicken breast (150g)
- Large salad with cucumber, tomatoes, spinach
- Lemon-tahini dressing (1 tbsp)
- ½ cup quinoa

**Snack (~150 kcal)**
- 1 apple + 10 almonds

**Dinner (~400 kcal)**
- Baked salmon (130g)
- Steamed broccoli + zucchini
- Cauliflower rice

**Macros:** ~140g protein · 130g carbs · 45g fat
> 💡 Drink 2–3 litres of water daily for optimal fat metabolism`,

  musclegain: `## 💪 Muscle Building Meal Plan (2,800–3,200 kcal)

**Breakfast (~700 kcal)**
- 4-egg omelette with spinach + feta
- 2 slices whole-grain toast
- 1 banana + protein shake (30g protein)

**Pre-workout Snack (~300 kcal)**
- Rice cakes (3) + 2 tbsp peanut butter

**Lunch (~800 kcal)**
- 200g chicken breast or ground beef
- 1.5 cups brown rice
- Roasted sweet potato
- Mixed vegetables

**Post-workout (~350 kcal)**
- Protein shake + 1 cup oats

**Dinner (~800 kcal)**
- 200g steak or salmon
- 1.5 cups pasta or rice
- Broccoli + asparagus + olive oil drizzle

**Macros:** ~220g protein · 380g carbs · 80g fat`,

  vegetarian: `## 🌱 Vegetarian Fitness Meal Plan (~1,800 kcal)

**Breakfast (~420 kcal)**
- Overnight oats: ½ cup oats + almond milk + protein powder + berries

**Lunch (~500 kcal)**
- Lentil and chickpea curry with basmati rice
- Cucumber raita on the side

**Snack (~200 kcal)**
- Hummus + carrot sticks + whole grain crackers

**Dinner (~550 kcal)**
- Tofu stir-fry with bell peppers, broccoli, edamame
- Brown rice or soba noodles

**Macros:** ~120g protein · 220g carbs · 55g fat
> 💡 Include B12 supplement and varied protein sources for complete amino acids`,

  preworkout: `## ⚡ Pre-Workout Nutrition Guide

**60–90 min before training:**
- Banana + 1 cup oats + honey = ~350 kcal, high carb, low fat

**30–45 min before:**
- Rice cakes + peanut butter = ~250 kcal, quick energy

**15–20 min before:**
- Date (2–3) + espresso = fast glucose + caffeine boost

**What to avoid before training:**
- High-fat meals (slow digestion)
- Large portions (stomach discomfort)
- Sugary drinks (energy crash)

> 💧 Hydrate with 500ml water 30 min before exercise`,

  postworkout: `## 🔄 Post-Workout Recovery Nutrition

**Within 30–45 min after training:**

**Option 1 — Shake**
- 1 scoop whey/plant protein (25–30g)
- 1 banana + 1 cup milk
- ~350 kcal | 35g protein | 45g carbs

**Option 2 — Food**
- Grilled chicken (150g) + white rice (1 cup)
- ~450 kcal | 40g protein | 55g carbs

**Option 3 — Vegetarian**
- Cottage cheese (200g) + fruit + granola
- ~380 kcal | 28g protein | 42g carbs

> 💡 The post-workout window is critical — protein synthesis peaks 30–60 min after exercise`,
};

const MOTIVATION = [
  `## 💪 Your Daily Fitness Boost

> *"The only bad workout is the one that didn't happen."*

**Today's Challenge:**
Start with just **10 minutes** of movement. Once you begin, momentum takes over.

**3 Habits That Transform Your Fitness:**
1. 🌅 **Morning movement** — even 5 min of stretching primes your body
2. 💧 **Hydrate first** — drink water before checking your phone
3. 📝 **Log your wins** — track every workout, no matter how small

**Remember:** Consistency beats perfection. Show up imperfectly every day and watch yourself transform. 🔥`,

  `## 🌟 Mindset Reset

> *"Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't."*

**When motivation is low, use DISCIPLINE:**
- Set your workout clothes out the night before
- Commit to just 5 minutes — starting is the hardest part
- Celebrate every rep, every step, every choice

**Quick Energy Boost:**
Try the **5-4-3-2-1** technique — count down and move before your brain talks you out of it! 🚀`,

  `## 🔥 Weekly Motivation Drop

**Progress Check:** You're doing better than you think!

**Facts about your fitness journey:**
- Week 1: Your body is learning
- Week 4: You start seeing changes
- Week 8: Others notice
- Week 12: You feel transformed

**This week's focus:** Focus on the PROCESS, not the outcome. Each workout deposits into your health bank account. 💰

> 💡 **Science fact:** Exercise releases BDNF — the "miracle grow" for your brain. You're literally getting smarter with every workout! 🧠`,
];

const RECOVERY = `## 😴 Recovery & Rest Day Guide

**Why Recovery Matters:**
Muscle growth happens during rest, not during the workout itself. Skipping recovery = leaving gains on the table.

**Active Recovery Options:**
- 🚶 20–30 min gentle walk
- 🧘 Yoga or deep stretching (20 min)
- 🏊 Light swimming
- 🚴 Easy cycling (low intensity)

**Recovery Toolkit:**

| Tool | Benefit |
|---|---|
| Foam rolling | Reduces muscle soreness by 30% |
| Epsom salt bath | Magnesium absorption, relaxation |
| Cold shower | Reduces inflammation |
| Sleep (7–9 hrs) | Peak hormone release for recovery |

**Nutrition on Rest Days:**
- Slightly reduce carbs (no intense training = less fuel needed)
- Keep protein high (1.6–2g per kg body weight)
- Stay hydrated — muscles are 75% water!

> 💡 **Signs you need more recovery:** persistent soreness, declining performance, disrupted sleep, irritability`;

const GOALS = `## 🎯 Goal Setting Framework for Fitness

**Use the SMART Fitness Goal Method:**

| Letter | Meaning | Example |
|---|---|---|
| S | Specific | "Run 5K" not "get fit" |
| M | Measurable | Track with a timer/app |
| A | Achievable | Start with 20 min jogs |
| R | Relevant | Aligns with health priorities |
| T | Time-bound | "In 8 weeks" |

**Popular 8-Week Goal Templates:**

🏃 **Cardio:** C25K (Couch to 5K) — from walking to running
💪 **Strength:** 10 push-up progression — 0 to 50 consecutive
⚖️ **Weight:** Caloric deficit of 300–500 kcal/day = ~0.5kg/week
🧘 **Flexibility:** Daily 15-min stretch to touch toes

**Weekly Check-in Questions:**
1. Did I train at least 3× this week?
2. Did I sleep 7+ hours on most nights?
3. Did I hit my protein target?
4. How is my energy and mood?

> 💡 Write your goal down and put it somewhere you'll see it every morning!`;

const HYDRATION = `## 💧 Hydration Guide for Fitness

**Your Daily Water Target:**
- Sedentary: **2 litres**
- Active (moderate workout): **2.5–3 litres**
- Intense training / hot weather: **3–4 litres**

**Formula:** Body weight (kg) × 35ml = daily baseline

**Hydration Timeline on Workout Days:**
| Time | Amount |
|---|---|
| Wake up | 500ml immediately |
| 30 min pre-workout | 400ml |
| During workout | 150–200ml every 20 min |
| Post-workout | 500ml |
| Evening | Sip remaining target |

**Signs of Dehydration During Exercise:**
- Performance drops by ~10% with just 2% dehydration
- Muscle cramps, headaches, dark urine

> 💡 Add lemon, cucumber, or mint to make water more appealing. Electrolytes (sodium, potassium) matter after heavy sweating!`;

const CALORIE_FOODS = {
  common: `## 🍽️ Common Food Calorie Reference

**Proteins:**
| Food | Portion | Calories | Protein |
|---|---|---|---|
| Chicken breast | 100g | 165 kcal | 31g |
| Eggs | 1 large | 70 kcal | 6g |
| Greek yogurt | 150g | 130 kcal | 17g |
| Tuna (canned) | 85g | 100 kcal | 22g |
| Cottage cheese | 100g | 98 kcal | 11g |

**Carbohydrates:**
| Food | Portion | Calories | Carbs |
|---|---|---|---|
| White rice | 1 cup cooked | 206 kcal | 45g |
| Brown rice | 1 cup cooked | 216 kcal | 45g |
| Oats | ½ cup dry | 150 kcal | 27g |
| Banana | 1 medium | 105 kcal | 27g |
| Sweet potato | 100g | 86 kcal | 20g |

**Fats:**
| Food | Portion | Calories | Fat |
|---|---|---|---|
| Almonds | 30g (handful) | 170 kcal | 15g |
| Peanut butter | 2 tbsp | 190 kcal | 16g |
| Avocado | ½ medium | 120 kcal | 10g |
| Olive oil | 1 tbsp | 120 kcal | 14g |

> 💡 Use the calorie tracker on the left to log your meals and hit your daily goal!`,
};

/**
 * Match user message to the best response category
 */
function matchCategory(message) {
  const msg = message.toLowerCase();

  if (/calor|calorie|kcal|food|eat|meal|diet|nutrition|macro|protein|carb|fat|weight loss|muscle|vegetarian|vegan|pre.?workout|post.?workout/.test(msg)) {
    if (/calorie|kcal|food.?(list|ref|count)|how many cal/.test(msg)) return 'calorie_ref';
    if (/weight.?loss|cut|deficit|slim|lean/.test(msg)) return 'meal_weightloss';
    if (/muscle|bulk|gain|mass/.test(msg)) return 'meal_musclegain';
    if (/vegetarian|vegan|plant/.test(msg)) return 'meal_vegetarian';
    if (/pre.?workout|before.*workout|before.*gym/.test(msg)) return 'meal_preworkout';
    if (/post.?workout|after.*workout|recovery.*food/.test(msg)) return 'meal_postworkout';
    return 'meal_weightloss';
  }

  if (/workout|exercise|train|routine|circuit|hiit|cardio|strength|push.?up|squat|fitness plan/.test(msg)) {
    if (/beginner|start|new|never/.test(msg)) return 'workout_beginner';
    if (/intermediate|moderate/.test(msg)) return 'workout_intermediate';
    if (/advanced|hard|intense/.test(msg)) return 'workout_advanced';
    return 'workout_beginner';
  }

  if (/motivat|inspir|quote|tired|lazy|give up|hard|struggle|encourage/.test(msg)) return 'motivation';
  if (/recover|rest|sore|sleep|rest.?day|foam.?roll/.test(msg)) return 'recovery';
  if (/goal|target|plan|objective|aim|improve/.test(msg)) return 'goals';
  if (/water|hydrat|drink/.test(msg)) return 'hydration';

  return 'motivation'; // default
}

function mockGraniteResponse(userMessage, context = {}) {
  const category = matchCategory(userMessage);
  const level = context.fitnessLevel || 'beginner';

  let text = '';

  switch (category) {
    case 'workout_beginner':
      text = context.workoutType === 'cardio'
        ? WORKOUTS.beginner.cardio
        : WORKOUTS.beginner.home;
      break;
    case 'workout_intermediate':
      text = context.workoutType === 'strength'
        ? WORKOUTS.intermediate.strength
        : WORKOUTS.intermediate.home;
      break;
    case 'workout_advanced':
      text = WORKOUTS.advanced.home;
      break;
    case 'meal_weightloss':
      text = MEALS.weightloss;
      break;
    case 'meal_musclegain':
      text = MEALS.musclegain;
      break;
    case 'meal_vegetarian':
      text = MEALS.vegetarian;
      break;
    case 'meal_preworkout':
      text = MEALS.preworkout;
      break;
    case 'meal_postworkout':
      text = MEALS.postworkout;
      break;
    case 'calorie_ref':
      text = CALORIE_FOODS.common;
      break;
    case 'motivation':
      text = MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
      break;
    case 'recovery':
      text = RECOVERY;
      break;
    case 'goals':
      text = GOALS;
      break;
    case 'hydration':
      text = HYDRATION;
      break;
    default:
      text = MOTIVATION[0];
  }

  return {
    text,
    model: 'fitness-buddy-mock-v1',
    usage: text.split(' ').length,
    source: 'mock',
  };
}

module.exports = { mockGraniteResponse };

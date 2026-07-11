'use strict';
/**
 * Fitness Buddy — Agent Service
 * Implements a PLAN → EXECUTE → REFLECT agentic loop
 * Calls IBM Granite via granite.service.js, falls back to mock responses
 */

const { ibmConfig } = require('../config/ibm.config');
const { generateFitnessResponse } = require('./granite.service');
const { mockGraniteResponse } = require('./mock-granite.service');

// ── Agent System Prompt ──────────────────────────────────────────────────────
const AGENT_SYSTEM_PROMPT = `You are FitAgent — an autonomous AI fitness planning agent for Fitness Buddy.
You operate in three modes: PLANNER, EXECUTOR, and REFLECTOR.

=== PLANNER MODE ===
Given a user profile and goal, output a strict JSON weekly plan with this exact schema:
{
  "mode": "plan",
  "weekly_plan": {
    "goal": "<string>",
    "weekly_calorie_target": <number>,
    "days": [
      {
        "day": "<Monday|Tuesday|...|Sunday>",
        "workout": { "type": "<string>", "duration_min": <number>, "exercises": ["<string>",...], "calories_burn": <number> },
        "meals": { "breakfast": "<string>", "lunch": "<string>", "dinner": "<string>", "snack": "<string>", "total_kcal": <number> },
        "focus": "<string>",
        "tip": "<string>"
      }
    ],
    "weekly_targets": { "workouts": <number>, "avg_daily_calories": <number>, "protein_g": <number> }
  },
  "user_message": "<encouraging 1-2 sentence message for the user>"
}

=== EXECUTOR MODE ===
Given a task and available tools, decide which tool to call and return:
{
  "mode": "execute",
  "tool_call": { "name": "<getFoodCalories|getWorkoutDetails|logEntry>", "args": { ... } },
  "reasoning": "<why this tool was chosen>",
  "user_message": "<brief message to show user>"
}

=== REFLECTOR MODE ===
Given the weekly plan and actual activity history, return an honest assessment:
{
  "mode": "reflect",
  "adherence_score": <0-100>,
  "completed_workouts": <number>,
  "avg_calories_logged": <number>,
  "wins": ["<string>", ...],
  "improvements": ["<string>", ...],
  "plan_adjustments": [{ "day": "<string>", "change": "<string>" }],
  "next_week_focus": "<string>",
  "user_message": "<motivating personalised message>"
}

RULES:
- Always return ONLY valid JSON. No markdown, no explanation outside the JSON.
- All numeric fields must be actual numbers, not strings.
- If data is unknown, use sensible fitness defaults.
- Be encouraging, specific, and actionable in all user_message fields.`;

// ── Tool Implementations ─────────────────────────────────────────────────────
const FOOD_DB = {
  banana: { calories: 105, protein: 1, carbs: 27, fat: 0 },
  egg: { calories: 70, protein: 6, carbs: 0, fat: 5 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 4 },
  oats: { calories: 150, protein: 5, carbs: 27, fat: 3 },
  rice: { calories: 206, protein: 4, carbs: 45, fat: 0 },
  salmon: { calories: 208, protein: 20, carbs: 0, fat: 13 },
  'greek yogurt': { calories: 130, protein: 17, carbs: 8, fat: 2 },
  almonds: { calories: 170, protein: 6, carbs: 6, fat: 15 },
  avocado: { calories: 120, protein: 1, carbs: 6, fat: 10 },
  'sweet potato': { calories: 86, protein: 2, carbs: 20, fat: 0 },
  apple: { calories: 95, protein: 0, carbs: 25, fat: 0 },
  'protein shake': { calories: 150, protein: 25, carbs: 8, fat: 3 },
};

const WORKOUT_DB = {
  home: { beginner: 180, intermediate: 320, advanced: 480 },
  cardio: { beginner: 250, intermediate: 380, advanced: 520 },
  hiit: { beginner: 300, intermediate: 430, advanced: 580 },
  strength: { beginner: 210, intermediate: 360, advanced: 500 },
  yoga: { beginner: 120, intermediate: 180, advanced: 240 },
};

function getFoodCalories(foodName) {
  const key = String(foodName).toLowerCase().trim();
  const match = FOOD_DB[key] || Object.entries(FOOD_DB).find(([k]) => key.includes(k))?.[1];
  if (match) return { food: foodName, ...match, source: 'agent-tool' };
  return { food: foodName, calories: 200, protein: 10, carbs: 25, fat: 8, source: 'agent-tool-estimated' };
}

function getWorkoutDetails(type, level, durationMin) {
  const typeKey = String(type).toLowerCase();
  const levelKey = String(level).toLowerCase();
  const dur = parseInt(durationMin) || 30;
  const baseBurn = (WORKOUT_DB[typeKey]?.[levelKey] || 250);
  const scaledBurn = Math.round(baseBurn * (dur / 30));
  return { type, level, duration_min: dur, calories_burn: scaledBurn, source: 'agent-tool' };
}

function logEntry(type, data) {
  // Server-side log (client stores via localStorage; this just validates & echoes)
  return { logged: true, type, data, timestamp: new Date().toISOString() };
}

// Tool dispatcher
const TOOLS = { getFoodCalories, getWorkoutDetails, logEntry };

function dispatchTool(toolCall) {
  const { name, args = {} } = toolCall;
  if (!TOOLS[name]) return { error: `Unknown tool: ${name}` };
  try {
    return TOOLS[name](...Object.values(args));
  } catch (e) {
    return { error: e.message };
  }
}

// ── JSON Parser with Retry ───────────────────────────────────────────────────
function extractJSON(text) {
  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  // Find first { or [
  const start = cleaned.search(/[{[]/);
  if (start === -1) throw new Error('No JSON object found in response');
  const jsonStr = cleaned.slice(start);
  return JSON.parse(jsonStr);
}

async function callAIWithRetry(prompt, context = {}) {
  // First attempt
  try {
    const result = await generateFitnessResponse(prompt, [], context);
    return extractJSON(result.text);
  } catch (firstErr) {
    console.warn('[Agent] First parse attempt failed:', firstErr.message, '— retrying with strict JSON instruction');
  }

  // Retry with stricter instruction
  const strictPrompt = `${prompt}\n\nCRITICAL: Return ONLY valid JSON. No explanation, no markdown, no text before or after the JSON object.`;
  try {
    const result = await generateFitnessResponse(strictPrompt, [], context);
    return extractJSON(result.text);
  } catch (secondErr) {
    console.warn('[Agent] Second parse attempt failed:', secondErr.message, '— using mock fallback');
    return null; // Signals to use mock
  }
}

// ── Mock Agent Responses ─────────────────────────────────────────────────────
function mockPlanWeek(profile, goal) {
  const level = profile.fitnessLevel || 'beginner';
  const calGoal = profile.calorieGoal || 2000;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const workoutTypes = ['home', 'cardio', 'strength', 'rest', 'hiit', 'yoga', 'rest'];
  const mealTemplates = {
    weightloss: ['Oatmeal + berries', 'Grilled chicken salad', 'Baked salmon + veggies', 'Apple + almonds'],
    musclegain: ['Eggs + toast + shake', 'Rice + chicken + broccoli', 'Steak + sweet potato', 'Greek yogurt + banana'],
    default: ['Oats + banana', 'Quinoa + chickpeas', 'Grilled fish + salad', 'Hummus + veggies'],
  };
  const meals = mealTemplates[goal?.replace(' ', '') === 'weightloss' ? 'weightloss' : goal === 'muscle gain' ? 'musclegain' : 'default'];

  return {
    mode: 'plan',
    weekly_plan: {
      goal,
      weekly_calorie_target: calGoal * 7,
      days: days.map((day, i) => {
        const type = workoutTypes[i];
        const isRest = type === 'rest';
        return {
          day,
          workout: isRest
            ? { type: 'rest', duration_min: 0, exercises: ['Light stretching', 'Walk'], calories_burn: 80 }
            : { type, duration_min: 30, exercises: ['Warm-up', 'Main circuit', 'Cool-down'], calories_burn: getWorkoutDetails(type, level, 30).calories_burn },
          meals: { breakfast: meals[0], lunch: meals[1], dinner: meals[2], snack: meals[3], total_kcal: calGoal },
          focus: isRest ? 'Recovery & mobility' : `${type.charAt(0).toUpperCase() + type.slice(1)} training`,
          tip: isRest ? '💧 Rest days are where gains happen. Stay hydrated!' : `💪 Push through the last set — that\'s where growth happens!`,
        };
      }),
      weekly_targets: { workouts: 5, avg_daily_calories: calGoal, protein_g: Math.round(calGoal * 0.3 / 4) },
    },
    user_message: `Here's your personalised 7-day plan for "${goal}"! You've got 5 workout days and 2 recovery days — the perfect balance. Let's crush it this week! 🚀`,
  };
}

function mockExecuteTask(context, task) {
  const taskLower = String(task).toLowerCase();
  let tool_call = { name: 'getFoodCalories', args: { food_name: 'chicken breast' } };
  let reasoning = 'Task appears to be about food/nutrition tracking.';
  if (/workout|exercise|train/.test(taskLower)) {
    tool_call = { name: 'getWorkoutDetails', args: { type: 'home', level: 'beginner', duration: 30 } };
    reasoning = 'Task is about workout details.';
  } else if (/log|track|record/.test(taskLower)) {
    tool_call = { name: 'logEntry', args: { type: 'food', data: { name: 'meal', calories: 400 } } };
    reasoning = 'Task is requesting to log an entry.';
  }
  const result = dispatchTool(tool_call);
  return { mode: 'execute', tool_call, tool_result: result, reasoning, user_message: '✅ Task executed successfully!' };
}

function mockReflectAndAdjust(weeklyPlan, history) {
  const completedWorkouts = history?.filter(h => h.type === 'workout').length || 0;
  const avgCal = history?.length
    ? Math.round(history.filter(h => h.calories).reduce((s, h) => s + h.calories, 0) / Math.max(1, history.filter(h => h.calories).length))
    : 0;
  const score = Math.min(100, Math.round((completedWorkouts / 5) * 60 + (avgCal > 0 ? 40 : 0)));

  return {
    mode: 'reflect',
    adherence_score: score,
    completed_workouts: completedWorkouts,
    avg_calories_logged: avgCal,
    wins: completedWorkouts > 0 ? [`Completed ${completedWorkouts} workout${completedWorkouts > 1 ? 's' : ''} this week`] : ['Opened the app and checked in — that counts!'],
    improvements: avgCal === 0 ? ['Start logging meals daily for better insights'] : ['Try to hit your calorie target more consistently'],
    plan_adjustments: completedWorkouts < 3 ? [{ day: 'Saturday', change: 'Add an extra light workout session to make up missed days' }] : [],
    next_week_focus: completedWorkouts >= 4 ? 'Increase workout intensity by 10%' : 'Build consistency — aim for 4 workouts this week',
    user_message: score >= 70
      ? `Amazing week! You scored ${score}/100 — you're building real momentum. Keep it up! 🔥`
      : `You scored ${score}/100 — every start is a win. Next week, let's focus on showing up consistently. You've got this! 💪`,
  };
}

// ── Exported Agent Functions ─────────────────────────────────────────────────

/**
 * PLANNER: Generate a personalised 7-day fitness plan
 */
async function planWeek(profile = {}, goal = 'general fitness') {
  console.log('[Agent] planWeek called for goal:', goal);

  const prompt = `${AGENT_SYSTEM_PROMPT}

=== CURRENT REQUEST: PLANNER MODE ===
User profile:
- Fitness level: ${profile.fitnessLevel || 'beginner'}
- Primary goal: ${goal}
- Equipment: ${profile.equipment || 'no equipment'}
- Dietary preference: ${profile.diet || 'no preference'}
- Daily calorie goal: ${profile.calorieGoal || 2000} kcal

Generate a complete 7-day personalised fitness and meal plan as JSON.`;

  const parsed = await callAIWithRetry(prompt, profile);
  if (parsed && parsed.weekly_plan) {
    console.log('[Agent] planWeek → IBM Granite response parsed OK');
    return parsed;
  }

  console.log('[Agent] planWeek → using mock fallback');
  return mockPlanWeek(profile, goal);
}

/**
 * EXECUTOR: Execute a specific task using available tools
 */
async function executeTask(modeInput, context = {}) {
  const { task = '', mode = 'execute' } = modeInput;
  console.log('[Agent] executeTask called:', task);

  // Try tool dispatch directly if task names a tool
  const toolMatch = task.match(/\b(getFoodCalories|getWorkoutDetails|logEntry)\b/);
  if (toolMatch) {
    const result = TOOLS[toolMatch[1]];
    if (result) {
      return { mode: 'execute', tool_call: { name: toolMatch[1], args: {} }, tool_result: {}, reasoning: 'Direct tool invocation', user_message: 'Tool executed.' };
    }
  }

  const prompt = `${AGENT_SYSTEM_PROMPT}

=== CURRENT REQUEST: EXECUTOR MODE ===
Task: "${task}"
User context: ${JSON.stringify(context)}
Available tools: getFoodCalories(food_name), getWorkoutDetails(type, level, duration), logEntry(type, data)

Choose the best tool and return the execute JSON.`;

  const parsed = await callAIWithRetry(prompt, context);
  const response = (parsed && parsed.tool_call) ? parsed : mockExecuteTask(context, task);

  // Run the tool on the server side
  if (response.tool_call) {
    response.tool_result = dispatchTool(response.tool_call);
  }

  return response;
}

/**
 * REFLECTOR: Analyse the week and suggest plan adjustments
 */
async function reflectAndAdjust(weeklyPlan = {}, history = []) {
  console.log('[Agent] reflectAndAdjust called, history entries:', history.length);

  const prompt = `${AGENT_SYSTEM_PROMPT}

=== CURRENT REQUEST: REFLECTOR MODE ===
Original weekly plan goal: ${weeklyPlan.goal || 'general fitness'}
Planned workouts: ${weeklyPlan.weekly_targets?.workouts || 5} per week
Planned avg calories: ${weeklyPlan.weekly_targets?.avg_daily_calories || 2000} kcal/day

Actual history (last 7 days):
${JSON.stringify(history.slice(-20), null, 2)}

Analyse adherence and provide JSON reflection with honest wins, improvements, and plan adjustments.`;

  const parsed = await callAIWithRetry(prompt, {});
  if (parsed && parsed.adherence_score !== undefined) {
    console.log('[Agent] reflectAndAdjust → IBM Granite response parsed OK');
    return parsed;
  }

  console.log('[Agent] reflectAndAdjust → using mock fallback');
  return mockReflectAndAdjust(weeklyPlan, history);
}

module.exports = { planWeek, executeTask, reflectAndAdjust, dispatchTool, getFoodCalories, getWorkoutDetails, logEntry, AGENT_SYSTEM_PROMPT };

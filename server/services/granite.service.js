'use strict';
/**
 * IBM Granite AI Service for Fitness Buddy
 * Wraps WatsonX.ai SDK — auto-detects correct region, falls back to mock
 */

const { ibmConfig, validateConfig } = require('../config/ibm.config');
const { mockGraniteResponse } = require('./mock-granite.service');

let WatsonXAI, IamAuthenticator;
let watsonxClient = null;
let isConfigured = false;
let initPromise = null; // ensures init runs only once

// Model IDs available in this IBM WatsonX.ai account (eu-de region)
const MODEL_IDS = [
  'ibm/granite-3-1-8b-base',
  'ibm/granite-4-h-small',
  'meta-llama/llama-3-3-70b-instruct',
  'meta-llama/llama-3-1-8b',
  'mistralai/mistral-small-3-1-24b-instruct-2503',
];

const REGIONS = [
  'https://eu-de.ml.cloud.ibm.com',
  'https://us-south.ml.cloud.ibm.com',
  'https://eu-de.ml.cloud.ibm.com',
  'https://eu-gb.ml.cloud.ibm.com',
  'https://au-syd.ml.cloud.ibm.com',
  'https://jp-tok.ml.cloud.ibm.com',
];

async function initClient() {
  // Return immediately if already initialized
  if (watsonxClient !== null || initPromise) return initPromise;

  initPromise = (async () => {
    try {
      ({ WatsonXAI } = require('@ibm-cloud/watsonx-ai'));
      try { ({ IamAuthenticator } = require('ibm-cloud-sdk-core')); } catch (_) {}

      if (!validateConfig()) {
        console.warn('[FitnessAI] Credentials missing — using mock mode');
        return;
      }

      // Deduplicate: put configured URL first
      const configuredUrl = ibmConfig.watsonx.serviceUrl;
      const regions = [configuredUrl, ...REGIONS.filter(r => r !== configuredUrl)];

      for (const serviceUrl of regions) {
        try {
          const opts = { version: ibmConfig.watsonx.version, serviceUrl };
          if (IamAuthenticator && ibmConfig.watsonx.apiKey) {
            opts.authenticator = new IamAuthenticator({ apikey: ibmConfig.watsonx.apiKey });
          } else {
            process.env.IBMCLOUD_API_KEY = ibmConfig.watsonx.apiKey;
          }

          const candidate = WatsonXAI.newInstance(opts);

          // Try each model ID until one succeeds for this region
          let connectedModel = null;
          for (const modelId of MODEL_IDS) {
            try {
              await candidate.generateText({
                modelId,
                projectId: ibmConfig.watsonx.projectId,
                input: 'Hi',
                parameters: { max_new_tokens: 5 },
              });
              connectedModel = modelId;
              break;
            } catch (modelErr) {
              // model not available in this region — try next
            }
          }

          if (connectedModel) {
            ibmConfig.models.chat = connectedModel; // lock in working model
            watsonxClient = candidate;
            isConfigured = true;
            console.log(`[FitnessAI] Connected ✓  region: ${serviceUrl}  model: ${connectedModel}`);
            break;
          } else {
            throw new Error('No compatible model found in this region');
          }
        } catch (e) {
          console.warn(`[FitnessAI] ${serviceUrl} → ${e.message?.slice(0, 90)}`);
        }
      }

      if (!isConfigured) {
        console.warn('[FitnessAI] All regions failed — falling back to mock mode');
      }
    } catch (err) {
      console.warn('[FitnessAI] IBM SDK unavailable — mock mode active:', err.message);
    }
  })();

  return initPromise;
}

// Kick off region detection at startup (non-blocking)
initClient().catch(() => {});

/**
 * Build a detailed, personalized fitness coach system prompt
 */
function buildSystemPrompt(context = {}) {
  const level = context.fitnessLevel || 'beginner';
  const goals = context.goals || 'general fitness';
  const equipment = context.equipment || 'no equipment';
  const diet = context.diet || 'no specific preference';
  const age = context.age ? `${context.age} years old` : 'age not specified';
  const gender = context.gender || 'not specified';
  const weight = context.weight ? `${context.weight} kg` : 'not specified';
  const height = context.height ? `${context.height} cm` : 'not specified';
  const bmi = context.bmi ? `${context.bmi} (${context.bmiCategory})` : 'not calculated';
  const tdee = context.tdee ? `${context.tdee} kcal/day` : 'not calculated';
  const calorieGoal = context.calorieGoal ? `${context.calorieGoal} kcal/day` : 'not set';
  const medical = context.medicalConditions || 'none reported';

  return `You are Buddy — an empathetic, expert, and motivating AI fitness coach.
You specialize in personalized health and fitness guidance for everyday people.

Your capabilities:
- Create custom workout routines (home, gym, outdoor) perfectly adapted to fitness level and available equipment
- Suggest nutritious, practical meal plans matched to goals, dietary preferences, and calorie targets
- Provide daily motivation, mindset coaching, and habit-building strategies
- Offer recovery advice, injury prevention, and sleep optimization
- Guide calorie tracking, macro planning, and BMI interpretation
- Support goal-setting with realistic, measurable milestones
- Detect unsafe requests (extreme weight loss, starvation diets, overtraining) and respond with safety advice

=== CURRENT USER PROFILE ===
- Name: ${context.name || 'not provided'}
- Age: ${age}
- Gender: ${gender}
- Height: ${height}
- Weight: ${weight}
- BMI: ${bmi}
- Estimated TDEE: ${tdee}
- Daily calorie goal: ${calorieGoal}
- Fitness level: ${level}
- Primary goal: ${goals}
- Available equipment: ${equipment}
- Dietary preference: ${diet}
- Medical conditions: ${medical}

=== RESPONSE FORMAT (ALWAYS USE THIS STRUCTURE) ===
Structure every response with these sections (use relevant emoji headers):

## 🏋️ Workout
(Exercises with sets, reps, rest time, muscles targeted in a table)

## 🥗 Diet
(Meal suggestions with calories and macros)

## 💧 Water Intake
(Daily target based on weight, timing schedule)

## 😴 Recovery
(Sleep, active recovery, foam rolling)

## ⚠️ Safety Tips
(Injury prevention, contraindications for medical conditions)

## 🎯 Daily Goal
(One clear, actionable goal for today)

## 💡 Why This Works
(Brief explanation of the scientific reasoning)

=== SAFETY RULES ===
- If user requests losing >1kg/week, WARN them about health risks before giving advice
- If user requests <1200 kcal/day diets, explain dangers and redirect
- If user has medical conditions, always recommend consulting their doctor
- Always include the disclaimer: "This app provides general guidance, not medical advice"

Guidelines:
- Be warm, encouraging, never judgmental
- Use markdown tables for workout exercises (columns: Exercise, Sets, Reps, Rest, Muscles)
- Personalize advice using the user's actual weight, age, and goals
- Calculate specific targets (e.g. protein = weight × 1.8g)
- Always end responses with a brief "💡 Why This Works" explanation`;
}

/**
 * Generate a fitness coaching response using IBM Granite via WatsonX.ai
 */
async function generateFitnessResponse(userMessage, history = [], context = {}) {
  // Wait for init to complete (no-op if already done)
  await initClient();

  if (!isConfigured || !watsonxClient) {
    console.log('[FitnessAI] Using intelligent mock response');
    return mockGraniteResponse(userMessage, context);
  }

  try {
    const systemPrompt = buildSystemPrompt(context);

    const conversationHistory = history
      .slice(-6)
      .map(t => `${t.role === 'user' ? 'Human' : 'Assistant'}: ${t.content}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\n${conversationHistory ? conversationHistory + '\n' : ''}Human: ${userMessage}\nAssistant:`;

    const response = await watsonxClient.generateText({
      modelId: ibmConfig.models.chat,
      projectId: ibmConfig.watsonx.projectId,
      input: fullPrompt,
      parameters: ibmConfig.generationParams,
    });

    const generatedText =
      response?.result?.results?.[0]?.generated_text?.trim() ||
      'I could not generate a response. Please try again.';

    return {
      text: generatedText,
      model: ibmConfig.models.chat,
      usage: response?.result?.results?.[0]?.generated_token_count || 0,
      source: 'ibm-granite',
    };
  } catch (err) {
    console.error('[FitnessAI] API error:', err.message);
    return mockGraniteResponse(userMessage, context);
  }
}

module.exports = { generateFitnessResponse };

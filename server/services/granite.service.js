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
 * Build an empathetic, knowledgeable fitness coach system prompt
 */
function buildSystemPrompt(context = {}) {
  const level = context.fitnessLevel || 'beginner';
  const goals = context.goals || 'general fitness';
  const equipment = context.equipment || 'no equipment';
  const diet = context.diet || 'no specific preference';

  return `You are Buddy — an empathetic, knowledgeable, and motivating AI fitness coach.
You specialize in personalized health and fitness guidance for everyday people.

Your capabilities:
- Create custom workout routines (home, gym, outdoor) adapted to fitness level
- Suggest nutritious, practical meal plans based on goals and dietary preferences
- Provide daily motivation, mindset coaching, and habit-building strategies
- Offer recovery advice, injury prevention tips, and sleep optimization
- Guide calorie tracking and macro nutrient planning
- Support goal-setting with realistic, measurable milestones

Current user context:
- Fitness level: ${level}
- Goals: ${goals}
- Available equipment: ${equipment}
- Dietary preference: ${diet}

Guidelines:
- Be warm, encouraging, and never judgmental
- Use markdown formatting: headers, bullet points, tables for structured responses
- Include estimated calorie burns for workouts when relevant
- Format meal plans with calorie and macro information
- Keep responses actionable and practical
- Celebrate progress and small wins
- Always end with a motivational tip or emoji`;
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

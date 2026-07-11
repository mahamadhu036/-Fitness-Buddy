'use strict';

const express = require('express');
const router  = express.Router();
const { generateFitnessResponse } = require('../services/granite.service');

/**
 * POST /api/chat
 * Main conversational endpoint — passes full user profile as context
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message is too long. Please keep it under 2000 characters.' });
    }

    const result = await generateFitnessResponse(message.trim(), history, context);

    res.json({
      success:   true,
      reply:     result.text,
      model:     result.model,
      source:    result.source,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[ChatRoute] Error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

/**
 * POST /api/workout
 * Generate a structured workout plan with full profile context
 */
router.post('/workout', async (req, res) => {
  try {
    const {
      fitnessLevel = 'beginner',
      workoutType  = 'home',
      duration     = 30,
      context      = {},
    } = req.body;

    // Build personalized prompt using full profile
    const age    = context.age    ? `${context.age}-year-old`    : '';
    const gender = context.gender ? context.gender               : '';
    const weight = context.weight ? `${context.weight}kg`        : '';
    const height = context.height ? `${context.height}cm`        : '';
    const goal   = context.goals  || 'general fitness';
    const equip  = context.equipment || 'no equipment';
    const medical = context.medicalConditions ? `Medical note: ${context.medicalConditions}.` : '';
    const bmiNote = context.bmi ? `BMI: ${context.bmi} (${context.bmiCategory}).` : '';

    const message = [
      `Create a detailed ${duration}-minute ${workoutType} workout plan for a`,
      age, gender, weight, height,
      `${fitnessLevel}-level person.`,
      `Goal: ${goal}. Equipment: ${equip}. ${bmiNote} ${medical}`,
      `Include: warm-up, main exercises as a table with (Exercise | Sets | Reps | Rest | Muscles Targeted),`,
      `estimated calories burned, cool-down, nutrition tips, water intake, recovery advice,`,
      `safety warnings, daily goal, and a "Why This Works" explanation.`,
    ].filter(Boolean).join(' ');

    const result = await generateFitnessResponse(message, [], {
      ...context,
      fitnessLevel,
      workoutType,
    });

    res.json({
      success: true,
      workout: result.text,
      model:   result.model,
      source:  result.source,
    });
  } catch (err) {
    console.error('[WorkoutRoute] Error:', err.message);
    res.status(500).json({ error: 'Could not generate workout. Please try again.' });
  }
});

/**
 * POST /api/meal
 * Suggest meal ideas based on goals and full profile
 */
router.post('/meal', async (req, res) => {
  try {
    const {
      goal     = 'weight loss',
      diet     = 'no preference',
      calories = 1800,
      context  = {},
    } = req.body;

    const weight  = context.weight ? `${context.weight}kg`  : '';
    const protein = context.weight ? `${Math.round(context.weight * 1.8)}g` : '~150g';

    const message = [
      `Create a full day meal plan for ${goal} with approximately ${calories} total calories.`,
      `Dietary preference: ${diet}. ${weight ? 'User weight: ' + weight + '.' : ''}`,
      `Protein target: ${protein}.`,
      `Include breakfast, lunch, dinner, and snacks with calorie and macro breakdown.`,
      `Also include water intake target, recovery tips, safety notes, and a daily goal.`,
    ].join(' ');

    const result = await generateFitnessResponse(message, [], { ...context, goals: goal, diet });

    res.json({
      success:  true,
      mealPlan: result.text,
      model:    result.model,
      source:   result.source,
    });
  } catch (err) {
    console.error('[MealRoute] Error:', err.message);
    res.status(500).json({ error: 'Could not generate meal plan. Please try again.' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Fitness Buddy API v2', timestamp: new Date().toISOString() });
});

module.exports = router;

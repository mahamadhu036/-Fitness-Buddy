'use strict';

const express = require('express');
const router = express.Router();
const { generateFitnessResponse } = require('../services/granite.service');

/**
 * POST /api/chat
 * Main conversational endpoint
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
      success: true,
      reply: result.text,
      model: result.model,
      source: result.source,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[ChatRoute] Error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

/**
 * POST /api/workout
 * Generate a structured workout plan
 */
router.post('/workout', async (req, res) => {
  try {
    const { fitnessLevel = 'beginner', workoutType = 'home', duration = 30, context = {} } = req.body;

    const message = `Create a ${duration}-minute ${workoutType} workout plan for a ${fitnessLevel} level person. Include warm-up, main exercises with sets/reps, estimated calories burned, and cool-down.`;

    const result = await generateFitnessResponse(message, [], { ...context, fitnessLevel, workoutType });

    res.json({
      success: true,
      workout: result.text,
      model: result.model,
      source: result.source,
    });
  } catch (err) {
    console.error('[WorkoutRoute] Error:', err.message);
    res.status(500).json({ error: 'Could not generate workout. Please try again.' });
  }
});

/**
 * POST /api/meal
 * Suggest meal ideas based on goals
 */
router.post('/meal', async (req, res) => {
  try {
    const { goal = 'weight loss', diet = 'no preference', calories = 1800, context = {} } = req.body;

    const message = `Create a full day meal plan for ${goal} with approximately ${calories} total calories. Dietary preference: ${diet}. Include breakfast, lunch, dinner, and snacks with calorie and macro breakdown.`;

    const result = await generateFitnessResponse(message, [], { ...context, goals: goal, diet });

    res.json({
      success: true,
      mealPlan: result.text,
      model: result.model,
      source: result.source,
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
  res.json({ status: 'ok', service: 'Fitness Buddy API', timestamp: new Date().toISOString() });
});

module.exports = router;

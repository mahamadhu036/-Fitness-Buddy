'use strict';
/**
 * Fitness Buddy — Agent Routes
 * POST /api/agent/plan    → PLANNER mode
 * POST /api/agent/execute → EXECUTOR mode
 * POST /api/agent/reflect → REFLECTOR mode
 */

const express = require('express');
const router = express.Router();
const { planWeek, executeTask, reflectAndAdjust, dispatchTool } = require('../services/agent.service');

// ── Middleware: validate & sanitise body ──────────────────────────────────────
function requireBody(...fields) {
  return (req, res, next) => {
    for (const f of fields) {
      if (req.body[f] === undefined) {
        return res.status(400).json({ error: `Missing required field: "${f}"` });
      }
    }
    next();
  };
}

// ── POST /api/agent/plan ──────────────────────────────────────────────────────
router.post('/plan', requireBody('profile', 'goal'), async (req, res) => {
  try {
    const { profile, goal } = req.body;

    if (typeof profile !== 'object' || !goal) {
      return res.status(400).json({ error: 'profile must be an object and goal must be a non-empty string' });
    }

    console.log(`[AgentRoute/plan] goal="${goal}" level="${profile.fitnessLevel}"`);
    const result = await planWeek(profile, goal);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[AgentRoute/plan] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate weekly plan. Please try again.' });
  }
});

// ── POST /api/agent/execute ───────────────────────────────────────────────────
router.post('/execute', async (req, res) => {
  try {
    const { mode = 'execute', context = {}, task = '' } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Missing required field: "task"' });
    }

    console.log(`[AgentRoute/execute] task="${task}"`);
    const result = await executeTask({ mode, task }, context);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[AgentRoute/execute] Error:', err.message);
    res.status(500).json({ error: 'Failed to execute task. Please try again.' });
  }
});

// ── POST /api/agent/reflect ───────────────────────────────────────────────────
router.post('/reflect', async (req, res) => {
  try {
    const { weeklyPlan = {}, history = [] } = req.body;

    if (!Array.isArray(history)) {
      return res.status(400).json({ error: '"history" must be an array' });
    }

    console.log(`[AgentRoute/reflect] history entries: ${history.length}`);
    const result = await reflectAndAdjust(weeklyPlan, history);

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[AgentRoute/reflect] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate reflection. Please try again.' });
  }
});

// ── POST /api/agent/tool ─────────────────────────────────────────────────────
// Direct tool invocation endpoint (useful for testing / frontend shortcut)
router.post('/tool', async (req, res) => {
  try {
    const { name, args = {} } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing "name" field' });

    const result = dispatchTool({ name, args });
    res.json({ success: true, result, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[AgentRoute/tool] Error:', err.message);
    res.status(500).json({ error: 'Tool execution failed.' });
  }
});

module.exports = router;

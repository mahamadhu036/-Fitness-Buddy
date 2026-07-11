/**
 * Fitness Buddy — Workout Planner v2
 * Generates workouts with exercise demos, logs history, passes full profile
 */

'use strict';

const WorkoutTracker = {
  history: [], // { id, title, type, level, duration, calories, date, timestamp }
  currentWorkout: null,
};

function loadWorkoutData() {
  try {
    WorkoutTracker.history = JSON.parse(localStorage.getItem('fb_workouts') || '[]');
  } catch (_) {
    WorkoutTracker.history = [];
  }
}

function saveWorkoutData() {
  try {
    localStorage.setItem('fb_workouts', JSON.stringify(WorkoutTracker.history.slice(-50)));
  } catch (_) {}
}

async function generateWorkout() {
  const level    = document.getElementById('wk-level').value;
  const type     = document.getElementById('wk-type').value;
  const duration = document.getElementById('wk-duration').value;
  const btn      = document.getElementById('gen-workout-btn');
  const resultEl = document.getElementById('workout-result');

  btn.disabled = true;
  btn.textContent = '⏳ Generating...';
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = `
    <div style="text-align:center;padding:30px;color:var(--text-muted)">
      <div style="font-size:2.5rem;margin-bottom:12px;animation:bounce-in 0.6s ease">🤖</div>
      <p>Buddy is crafting your personalized workout...</p>
      <p style="font-size:0.8rem;margin-top:6px;color:var(--text-muted)">Including sets, reps, rest times &amp; muscles targeted</p>
    </div>`;

  try {
    // Get full profile for personalization
    const profile = typeof getProfile === 'function' ? getProfile() : {};

    const res = await fetch('/api/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fitnessLevel: level,
        workoutType:  type,
        duration:     parseInt(duration),
        context: {
          ...profile,
          fitnessLevel: level,
          workoutType:  type,
        },
      }),
    });
    const data = await res.json();

    if (data.success) {
      WorkoutTracker.currentWorkout = { level, type, duration, text: data.workout };

      // Render with a nice header
      const typeLabels = {
        home: '🏠 Home Workout', cardio: '🏃 Cardio', strength: '🏋️ Strength',
        hiit: '⚡ HIIT', yoga: '🧘 Yoga / Flexibility',
      };

      resultEl.innerHTML = `
        <div class="workout-result-header">
          <div class="workout-result-title">${typeLabels[type] || type}</div>
          <div class="workout-result-meta">
            <span>⏱ ${duration} min</span>
            <span>🎯 ${capitalize(level)}</span>
          </div>
        </div>
        <div class="workout-result-body">${renderMarkdown(data.workout)}</div>
        <div class="workout-result-actions">
          <button class="btn btn-green btn-sm" onclick="logWorkout()">✅ Log This Workout</button>
          <button class="btn btn-outline btn-sm" onclick="generateWorkout()">🔄 Generate New</button>
        </div>`;

      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('💪 Workout ready with full exercise guide!', 'success');
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (err) {
    resultEl.innerHTML = `
      <div style="color:var(--red);padding:20px;text-align:center">
        <div style="font-size:2rem;margin-bottom:8px">❌</div>
        <p>Could not generate workout. Check your connection and try again.</p>
        <button class="btn btn-outline btn-sm mt-8" onclick="generateWorkout()">🔄 Retry</button>
      </div>`;
    showToast('Could not generate workout. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Generate Workout';
  }
}

function logWorkout() {
  const level    = document.getElementById('wk-level').value;
  const type     = document.getElementById('wk-type').value;
  const duration = parseInt(document.getElementById('wk-duration').value);

  // Calorie burns by type and level
  const calBurnTable = {
    home:     { beginner: 6.0,  intermediate: 8.0,  advanced: 10.0 },
    cardio:   { beginner: 8.5,  intermediate: 11.0, advanced: 13.5 },
    strength: { beginner: 6.5,  intermediate: 8.5,  advanced: 11.0 },
    hiit:     { beginner: 10.0, intermediate: 13.0, advanced: 16.0 },
    yoga:     { beginner: 3.0,  intermediate: 4.0,  advanced: 5.0  },
  };

  const profile = typeof getProfile === 'function' ? getProfile() : {};
  const weight  = profile.weight || 70; // default 70kg
  const levelKey = level || 'beginner';
  const burnRate = calBurnTable[type]?.[levelKey] || 7;
  // MET-style estimate: burn rate × weight factor (scaled from 70kg baseline)
  const weightFactor = weight / 70;
  const calories = Math.round(burnRate * duration * weightFactor);

  const typeLabels = {
    home: '🏠 Home Workout', cardio: '🏃 Cardio', strength: '🏋️ Strength',
    hiit: '⚡ HIIT', yoga: '🧘 Yoga / Stretch',
  };

  const entry = {
    id:        Date.now().toString(),
    title:     typeLabels[type] || type,
    type,
    level,
    duration,
    calories,
    date:      new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
    timestamp: Date.now(),
  };

  WorkoutTracker.history.unshift(entry);
  saveWorkoutData();
  renderWorkoutHistory();
  if (typeof updateDashboardStats === 'function') updateDashboardStats();
  if (typeof updateStreak === 'function') updateStreak();

  // Check achievements after logging
  if (typeof checkAchievements === 'function') {
    const newly = checkAchievements();
    if (newly.length && typeof renderAchievements === 'function') renderAchievements();
  }

  showToast(`✅ ${entry.title} logged! ~${entry.calories} calories burned 🔥`, 'success');
}

function renderWorkoutHistory() {
  const container = document.getElementById('workout-history');
  if (!container) return;

  if (!WorkoutTracker.history.length) {
    container.innerHTML = `
      <div class="empty-log">
        <div style="font-size:2.5rem;margin-bottom:8px">🏃</div>
        <p>No workouts logged yet.</p>
        <p class="text-sm text-muted mt-8">Generate a workout above and log it after completion!</p>
      </div>`;
    return;
  }

  container.innerHTML = WorkoutTracker.history.slice(0, 10).map(w => `
    <div class="workout-history-item fade-up">
      <div class="workout-history-icon">${getWorkoutIcon(w.type)}</div>
      <div class="workout-history-info">
        <div class="workout-history-title">${w.title}</div>
        <div class="workout-history-sub">${w.date} · ${w.duration} min · ${capitalize(w.level)}</div>
      </div>
      <div class="workout-history-cal">🔥 ${w.calories} kcal</div>
    </div>
  `).join('');
}

function getWorkoutIcon(type) {
  const icons = { home: '🏠', cardio: '🏃', strength: '🏋️', hiit: '⚡', yoga: '🧘' };
  return icons[type] || '💪';
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function getWeeklyWorkoutCount() {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return WorkoutTracker.history.filter(w => w.timestamp > weekAgo).length;
}

function initWorkoutPlanner() {
  loadWorkoutData();
  renderWorkoutHistory();
}

/**
 * Fitness Buddy — Workout Planner
 * Generates and logs workouts using AI backend
 */

'use strict';

const WorkoutTracker = {
  history: [], // { id, title, type, level, duration, calories, date }
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
  const level = document.getElementById('wk-level').value;
  const type = document.getElementById('wk-type').value;
  const duration = document.getElementById('wk-duration').value;
  const btn = document.getElementById('gen-workout-btn');
  const resultEl = document.getElementById('workout-result');

  btn.disabled = true;
  btn.textContent = '⏳ Generating...';
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)">🤖 Buddy is crafting your perfect workout...</div>';

  try {
    const profile = getProfile();
    const res = await fetch('/api/workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fitnessLevel: level,
        workoutType: type,
        duration: parseInt(duration),
        context: profile,
      }),
    });
    const data = await res.json();

    if (data.success) {
      WorkoutTracker.currentWorkout = { level, type, duration, text: data.workout };
      resultEl.innerHTML = renderMarkdown(data.workout);

      // Auto-scroll to result
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('💪 Workout ready! Scroll down to see your routine.', 'success');
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    resultEl.innerHTML = '<div style="color:var(--red);padding:20px;text-align:center">❌ Could not generate workout. Check your connection and try again.</div>';
    showToast('Could not generate workout. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '⚡ Generate Workout';
  }
}

function logWorkout() {
  const level = document.getElementById('wk-level').value;
  const type = document.getElementById('wk-type').value;
  const duration = parseInt(document.getElementById('wk-duration').value);

  // Estimated calorie burns by type
  const calBurn = {
    home: Math.round(duration * 6.5),
    cardio: Math.round(duration * 9),
    strength: Math.round(duration * 7.5),
    hiit: Math.round(duration * 11),
    yoga: Math.round(duration * 3.5),
  };

  const typeLabels = {
    home: '🏠 Home Workout', cardio: '🏃 Cardio', strength: '🏋️ Strength',
    hiit: '⚡ HIIT', yoga: '🧘 Yoga / Stretch',
  };

  const entry = {
    id: Date.now().toString(),
    title: typeLabels[type] || type,
    type, level, duration,
    calories: calBurn[type] || Math.round(duration * 7),
    date: new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
    timestamp: Date.now(),
  };

  WorkoutTracker.history.unshift(entry);
  saveWorkoutData();
  renderWorkoutHistory();
  updateDashboardStats();

  // Update streak
  updateStreak();

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
      <div class="workout-history-cal">🔥 ${w.calories}</div>
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

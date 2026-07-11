/**
 * Fitness Buddy — Daily Calorie & Nutrition Tracker
 * Manages food logging, macro tracking, and calorie goal persistence
 */

'use strict';

// ── State ──────────────────────────────────────────────
const CalTracker = {
  goal: 2000,
  entries: [], // { id, name, calories, protein, carbs, fat, meal, time }

  // Macro targets (derived from calorie goal)
  get macroTargets() {
    return {
      protein: Math.round(this.goal * 0.3 / 4),  // 30% calories from protein
      carbs:   Math.round(this.goal * 0.45 / 4), // 45% from carbs
      fat:     Math.round(this.goal * 0.25 / 9), // 25% from fat
    };
  },
  get totals() {
    return this.entries.reduce((acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein:  acc.protein  + (e.protein  || 0),
      carbs:    acc.carbs    + (e.carbs    || 0),
      fat:      acc.fat      + (e.fat      || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  },
};

// ── Common Quick-Add Foods ─────────────────────────────
const QUICK_FOODS = [
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Egg (1 large)', calories: 70, protein: 6, carbs: 0, fat: 5 },
  { name: 'Greek Yogurt 150g', calories: 130, protein: 17, carbs: 8, fat: 2 },
  { name: 'Chicken Breast 100g', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'Brown Rice 1 cup', calories: 216, protein: 5, carbs: 45, fat: 2 },
  { name: 'Almonds 30g', calories: 170, protein: 6, carbs: 6, fat: 15 },
  { name: 'Oats ½ cup', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: 'Salmon 100g', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Avocado ½', calories: 120, protein: 1, carbs: 6, fat: 10 },
  { name: 'Protein Shake', calories: 150, protein: 25, carbs: 8, fat: 3 },
  { name: 'Sweet Potato 100g', calories: 86, protein: 2, carbs: 20, fat: 0 },
  { name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 },
];

// ── Storage key helpers ───────────────────────────────
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadCalorieData() {
  try {
    const today = getTodayKey();
    const stored = JSON.parse(localStorage.getItem('fb_calories') || '{}');
    CalTracker.goal = parseInt(localStorage.getItem('fb_calorie_goal') || '2000');
    CalTracker.entries = stored[today] || [];
  } catch (_) {
    CalTracker.entries = [];
  }
}

function saveCalorieData() {
  try {
    const today = getTodayKey();
    const stored = JSON.parse(localStorage.getItem('fb_calories') || '{}');
    stored[today] = CalTracker.entries;
    localStorage.setItem('fb_calories', JSON.stringify(stored));
    localStorage.setItem('fb_calorie_goal', String(CalTracker.goal));
  } catch (_) {}
}

// Keep last 7 days of history for dashboard chart
function getWeeklyCalorieHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem('fb_calories') || '{}');
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayEntries = stored[key] || [];
      const total = dayEntries.reduce((s, e) => s + (e.calories || 0), 0);
      result.push({ date: key, calories: total, day: d.toLocaleDateString('en', { weekday: 'short' }) });
    }
    return result;
  } catch (_) {
    return [];
  }
}

// ── UI Update ─────────────────────────────────────────
function updateCalorieUI() {
  const t = CalTracker.totals;
  const remaining = CalTracker.goal - t.calories;
  const pct = Math.min(100, Math.round((t.calories / CalTracker.goal) * 100));
  const mt = CalTracker.macroTargets;

  // Cards
  document.getElementById('goal-display').textContent = CalTracker.goal.toLocaleString();
  document.getElementById('consumed-display').textContent = t.calories.toLocaleString();

  const remEl = document.getElementById('remaining-display');
  remEl.textContent = Math.abs(remaining).toLocaleString();
  remEl.classList.toggle('surplus', remaining < 0);

  // Calorie goal input sync
  const goalInput = document.getElementById('calorie-goal-input');
  if (goalInput) goalInput.value = CalTracker.goal;

  // Progress ring
  const circumference = 351.86;
  const offset = circumference - (pct / 100) * circumference;
  const ring = document.getElementById('cal-ring');
  if (ring) ring.style.strokeDashoffset = offset;
  const pctEl = document.getElementById('ring-pct');
  if (pctEl) pctEl.textContent = pct + '%';

  // Macro bars
  const updateMacro = (name, val, target) => {
    const barPct = Math.min(100, Math.round((val / Math.max(1, target)) * 100));
    const bar = document.getElementById(name + '-bar');
    const valEl = document.getElementById(name + '-val');
    if (bar) bar.style.width = barPct + '%';
    if (valEl) valEl.textContent = `${Math.round(val)} / ${target}g`;
  };
  updateMacro('protein', t.protein, mt.protein);
  updateMacro('carbs', t.carbs, mt.carbs);
  updateMacro('fat', t.fat, mt.fat);

  // Render food log
  renderFoodLog();

  // Sync dashboard stats
  const statCal = document.getElementById('stat-calories');
  const statGoal = document.getElementById('stat-goal');
  if (statCal) statCal.textContent = t.calories.toLocaleString();
  if (statGoal) statGoal.textContent = CalTracker.goal.toLocaleString();

  // Update week chart if on dashboard
  if (typeof renderWeekChart === 'function') renderWeekChart();
}

function renderFoodLog() {
  const container = document.getElementById('food-log-container');
  if (!container) return;

  if (CalTracker.entries.length === 0) {
    container.innerHTML = `
      <div class="empty-log">
        <div style="font-size:2.5rem;margin-bottom:8px">🍽️</div>
        <p>No meals logged yet today.</p>
        <p class="text-sm text-muted mt-8">Add your first meal above to start tracking!</p>
      </div>`;
    return;
  }

  // Group by meal
  const byMeal = { breakfast: [], lunch: [], dinner: [], snack: [] };
  CalTracker.entries.forEach(e => (byMeal[e.meal] || byMeal.snack).push(e));
  const mealLabels = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner', snack: '🍎 Snacks' };

  let html = '<table class="food-log-table"><thead><tr><th>Food</th><th>Meal</th><th>Cal</th><th>P</th><th>C</th><th>F</th><th></th></tr></thead><tbody>';

  Object.entries(byMeal).forEach(([meal, items]) => {
    if (!items.length) return;
    items.forEach(entry => {
      html += `
        <tr>
          <td class="food-name">${escapeHtml(entry.name)}</td>
          <td><span class="meal-badge ${meal}">${meal}</span></td>
          <td><strong>${entry.calories}</strong></td>
          <td>${entry.protein || 0}g</td>
          <td>${entry.carbs || 0}g</td>
          <td>${entry.fat || 0}g</td>
          <td>
            <button class="delete-food-btn" onclick="deleteFoodEntry('${entry.id}')" title="Remove">✕</button>
          </td>
        </tr>`;
    });
  });

  // Totals row
  const t = CalTracker.totals;
  html += `
    <tr style="font-weight:700;border-top:2px solid var(--border)">
      <td colspan="2" style="color:var(--text-secondary)">Total</td>
      <td style="color:var(--coral)">${t.calories}</td>
      <td style="color:var(--blue-primary)">${Math.round(t.protein)}g</td>
      <td style="color:var(--yellow)">${Math.round(t.carbs)}g</td>
      <td style="color:var(--coral-light)">${Math.round(t.fat)}g</td>
      <td></td>
    </tr>`;

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ── Actions ───────────────────────────────────────────
function addFoodEntry() {
  const name = document.getElementById('food-name').value.trim();
  const calories = parseInt(document.getElementById('food-calories').value) || 0;
  const meal = document.getElementById('food-meal').value;
  const protein = parseFloat(document.getElementById('food-protein').value) || 0;
  const carbs = parseFloat(document.getElementById('food-carbs').value) || 0;
  const fat = parseFloat(document.getElementById('food-fat').value) || 0;

  if (!name) {
    showToast('Please enter a food name.', 'error');
    document.getElementById('food-name').focus();
    return;
  }
  if (calories <= 0) {
    showToast('Please enter the calorie count.', 'error');
    document.getElementById('food-calories').focus();
    return;
  }

  CalTracker.entries.push({
    id: Date.now().toString(),
    name, calories, protein, carbs, fat, meal,
    time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
  });

  saveCalorieData();
  updateCalorieUI();
  clearFoodForm();
  showToast(`✅ ${name} added to ${meal}!`, 'success');
}

function quickAddFood(food) {
  document.getElementById('food-name').value = food.name;
  document.getElementById('food-calories').value = food.calories;
  document.getElementById('food-protein').value = food.protein;
  document.getElementById('food-carbs').value = food.carbs;
  document.getElementById('food-fat').value = food.fat;
  document.getElementById('food-name').focus();
  showToast(`📝 "${food.name}" filled in — select meal and click Add!`, 'info');
}

function deleteFoodEntry(id) {
  CalTracker.entries = CalTracker.entries.filter(e => e.id !== id);
  saveCalorieData();
  updateCalorieUI();
  showToast('Removed from log.', 'info');
}

function clearFoodForm() {
  ['food-name', 'food-calories', 'food-protein', 'food-carbs', 'food-fat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function clearFoodLog() {
  if (!CalTracker.entries.length) { showToast('Log is already empty.', 'info'); return; }
  if (!confirm('Clear all food entries for today?')) return;
  CalTracker.entries = [];
  saveCalorieData();
  updateCalorieUI();
  showToast('Today\'s log cleared.', 'info');
}

function updateCalorieGoal() {
  const val = parseInt(document.getElementById('calorie-goal-input').value);
  if (!val || val < 800 || val > 5000) {
    showToast('Please enter a goal between 800 and 5000 kcal.', 'error');
    return;
  }
  CalTracker.goal = val;
  saveCalorieData();
  updateCalorieUI();
  showToast(`🎯 Daily goal set to ${val} kcal!`, 'success');
}

function applyGoalPreset() {
  const sel = document.getElementById('goal-preset');
  if (!sel.value) return;
  document.getElementById('calorie-goal-input').value = sel.value;
  sel.value = '';
  updateCalorieGoal();
}

function askAIForCalories() {
  const name = document.getElementById('food-name').value.trim();
  if (!name) {
    showToast('Enter a food name first, then ask AI for calories!', 'info');
    return;
  }
  navigate('chat');
  // Pre-fill chat and send
  setTimeout(() => {
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = `How many calories and macros are in ${name}?`;
      sendMessage();
    }
  }, 300);
}

function renderQuickFoods() {
  const container = document.getElementById('quick-foods-list');
  if (!container) return;
  container.innerHTML = QUICK_FOODS.map(f => `
    <button class="quick-food-btn" onclick="quickAddFood(${JSON.stringify(f).replace(/"/g, '&quot;')})">
      ${f.name} <span style="opacity:0.6">${f.calories}cal</span>
    </button>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Init ──────────────────────────────────────────────
function initCalorieTracker() {
  loadCalorieData();
  renderQuickFoods();
  updateCalorieUI();
}

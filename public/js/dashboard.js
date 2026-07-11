/**
 * Fitness Buddy — Progress Dashboard
 * Stats aggregation, streak tracking, weekly chart, and motivational quotes
 */

'use strict';

const QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "The body achieves what the mind believes.", author: "Unknown" },
  { text: "Success starts with self-discipline.", author: "Unknown" },
  { text: "Every step forward is a step in the right direction.", author: "Fitness Buddy AI" },
  { text: "Don't wish for a good body, work for it.", author: "Unknown" },
  { text: "Fall in love with taking care of yourself — body, mind, and soul.", author: "Unknown" },
  { text: "Your health is an investment, not an expense.", author: "Unknown" },
  { text: "Strength does not come from the body. It comes from the will of the soul.", author: "Gandhi" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The groundwork of all happiness is health.", author: "Leigh Hunt" },
  { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Unknown" },
];

// ── Streak ─────────────────────────────────────────────
function updateStreak() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const streakData = JSON.parse(localStorage.getItem('fb_streak') || '{"count":0,"lastDate":""}');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);

    if (streakData.lastDate === today) {
      // Already counted today — no change
    } else if (streakData.lastDate === yKey) {
      // Consecutive day
      streakData.count += 1;
      streakData.lastDate = today;
    } else {
      // Streak broken (or first day)
      streakData.count = 1;
      streakData.lastDate = today;
    }

    localStorage.setItem('fb_streak', JSON.stringify(streakData));
    renderStreak(streakData.count);
  } catch (_) {}
}

function getStreakCount() {
  try {
    return JSON.parse(localStorage.getItem('fb_streak') || '{"count":0}').count;
  } catch (_) { return 0; }
}

function renderStreak(count) {
  const el = document.getElementById('streak-count');
  if (el) el.textContent = count;
}

// ── Dashboard Stats ───────────────────────────────────
function updateDashboardStats() {
  // Chat count
  const chatCount = parseInt(localStorage.getItem('fb_chat_count') || '0');
  const statChats = document.getElementById('stat-chats');
  if (statChats) statChats.textContent = chatCount;

  // Calorie stats — from CalTracker
  if (typeof CalTracker !== 'undefined') {
    const statCal = document.getElementById('stat-calories');
    const statGoal = document.getElementById('stat-goal');
    if (statCal) statCal.textContent = CalTracker.totals.calories.toLocaleString();
    if (statGoal) statGoal.textContent = CalTracker.goal.toLocaleString();
  }

  // Workout count
  const workoutCount = typeof getWeeklyWorkoutCount === 'function' ? getWeeklyWorkoutCount() : 0;
  const statWorkouts = document.getElementById('stat-workouts');
  if (statWorkouts) statWorkouts.textContent = workoutCount;

  // Days active
  const daysActive = getDaysActive();
  const statDays = document.getElementById('stat-days');
  if (statDays) statDays.textContent = daysActive;

  // Streak
  renderStreak(getStreakCount());

  // Week chart
  renderWeekChart();
}

function getDaysActive() {
  try {
    const stored = JSON.parse(localStorage.getItem('fb_calories') || '{}');
    return Object.keys(stored).length;
  } catch (_) { return 0; }
}

// ── Weekly Calorie Chart ───────────────────────────────
function renderWeekChart() {
  const container = document.getElementById('week-chart-bars');
  if (!container) return;

  const history = typeof getWeeklyCalorieHistory === 'function'
    ? getWeeklyCalorieHistory()
    : [];

  if (!history.length) {
    container.innerHTML = '<div style="color:var(--text-muted);text-align:center;width:100%;font-size:0.85rem">No data yet — start logging meals!</div>';
    return;
  }

  const goal = typeof CalTracker !== 'undefined' ? CalTracker.goal : 2000;
  const maxVal = Math.max(goal, ...history.map(d => d.calories), 1);
  const today = new Date().toISOString().slice(0, 10);

  container.innerHTML = history.map(d => {
    const heightPct = Math.round((d.calories / maxVal) * 100);
    const isToday = d.date === today;
    const goalMet = d.calories >= goal * 0.85 && d.calories <= goal * 1.15;
    let cls = 'chart-bar';
    if (isToday) cls += ' today';
    else if (goalMet && d.calories > 0) cls += ' goal-met';

    return `
      <div class="chart-bar-wrap">
        <div class="${cls}" style="height:${heightPct}%" title="${d.calories} kcal"></div>
        <span class="chart-day">${d.day}</span>
      </div>`;
  }).join('');
}

// ── Motivational Quotes ───────────────────────────────
function renderDailyQuote() {
  const dayIndex = new Date().getDay();
  const quote = QUOTES[dayIndex % QUOTES.length];
  const quoteEl = document.getElementById('daily-quote');
  const authorEl = document.getElementById('daily-quote-author');
  if (quoteEl) quoteEl.textContent = `"${quote.text}"`;
  if (authorEl) authorEl.textContent = `— ${quote.author}`;
}

function refreshQuote() {
  const current = document.getElementById('daily-quote')?.textContent || '';
  const unused = QUOTES.filter(q => !current.includes(q.text));
  const pool = unused.length ? unused : QUOTES;
  const q = pool[Math.floor(Math.random() * pool.length)];
  const quoteEl = document.getElementById('daily-quote');
  const authorEl = document.getElementById('daily-quote-author');
  if (quoteEl) { quoteEl.style.opacity = '0'; setTimeout(() => { quoteEl.textContent = `"${q.text}"`; quoteEl.style.opacity = '1'; }, 200); }
  if (authorEl) authorEl.textContent = `— ${q.author}`;
}

function initDashboard() {
  updateDashboardStats();
  renderDailyQuote();
}

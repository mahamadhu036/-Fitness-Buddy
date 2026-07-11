/**
 * Fitness Buddy — Achievements & Gamification
 * Tracks milestones, unlocks badges, renders achievement cards
 */

'use strict';

const ACHIEVEMENT_DEFS = [
  { id: 'first_chat',      icon: '💬', title: 'First Chat',         desc: 'Had your first conversation with Buddy',       tier: 'bronze',  check: () => (parseInt(localStorage.getItem('fb_chat_count') || '0')) >= 1 },
  { id: 'first_workout',   icon: '🥉', title: 'First Workout',      desc: 'Logged your very first workout',               tier: 'bronze',  check: () => getWorkoutHistoryCount() >= 1 },
  { id: 'streak_3',        icon: '🔥', title: '3-Day Streak',        desc: 'Worked out 3 days in a row',                  tier: 'bronze',  check: () => getStreakCount() >= 3 },
  { id: 'streak_7',        icon: '🔥', title: '7-Day Streak',        desc: 'A full week of consistency!',                 tier: 'silver',  check: () => getStreakCount() >= 7 },
  { id: 'streak_30',       icon: '🔥', title: '30-Day Streak',       desc: 'One month of unstoppable dedication',         tier: 'gold',    check: () => getStreakCount() >= 30 },
  { id: 'workouts_5',      icon: '💪', title: '5 Workouts',          desc: 'Completed 5 total workouts',                  tier: 'bronze',  check: () => getWorkoutHistoryCount() >= 5 },
  { id: 'workouts_10',     icon: '💪', title: '10 Workouts',         desc: '10 workouts completed — you\'re on fire!',   tier: 'silver',  check: () => getWorkoutHistoryCount() >= 10 },
  { id: 'workouts_25',     icon: '🏆', title: '25 Workouts',         desc: 'A quarter century of sweat and gains',        tier: 'gold',    check: () => getWorkoutHistoryCount() >= 25 },
  { id: 'workouts_50',     icon: '🌟', title: 'Fitness Legend',      desc: '50 workouts — you\'re a legend!',            tier: 'platinum',check: () => getWorkoutHistoryCount() >= 50 },
  { id: 'calories_tracked',icon: '🥗', title: 'Calorie Counter',     desc: 'Logged food for the first time',              tier: 'bronze',  check: () => getTotalCaloriesLogged() > 0 },
  { id: 'calories_week',   icon: '🥗', title: 'Nutrition Week',      desc: 'Tracked meals for 7 days',                    tier: 'silver',  check: () => getDaysWithCaloriesLogged() >= 7 },
  { id: 'profile_complete',icon: '👤', title: 'Profile Complete',    desc: 'Filled in your fitness profile',              tier: 'bronze',  check: () => isProfileComplete() },
  { id: 'bmi_calculated',  icon: '📊', title: 'Know Your Numbers',   desc: 'Calculated your BMI and TDEE',                tier: 'bronze',  check: () => !!localStorage.getItem('fb_bmi') },
  { id: 'chat_10',         icon: '🤝', title: 'Buddy\'s Friend',     desc: 'Had 10 conversations with Buddy',             tier: 'silver',  check: () => (parseInt(localStorage.getItem('fb_chat_count') || '0')) >= 10 },
  { id: 'water_goal',      icon: '💧', title: 'Hydration Hero',      desc: 'Hit your daily water goal',                   tier: 'bronze',  check: () => getWaterGlasses() >= 8 },
  { id: 'weekly_plan',     icon: '📅', title: 'Planner',             desc: 'Generated your first weekly plan',            tier: 'bronze',  check: () => !!localStorage.getItem('fb_weekly_plan') },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function getWorkoutHistoryCount() {
  try {
    return JSON.parse(localStorage.getItem('fb_workouts') || '[]').length;
  } catch (_) { return 0; }
}

function getStreakCount() {
  try {
    return JSON.parse(localStorage.getItem('fb_streak') || '{"count":0}').count;
  } catch (_) { return 0; }
}

function getTotalCaloriesLogged() {
  try {
    const data = JSON.parse(localStorage.getItem('fb_calories') || '{}');
    return Object.values(data).reduce((s, d) => s + (d.total || 0), 0);
  } catch (_) { return 0; }
}

function getDaysWithCaloriesLogged() {
  try {
    return Object.keys(JSON.parse(localStorage.getItem('fb_calories') || '{}')).length;
  } catch (_) { return 0; }
}

function isProfileComplete() {
  try {
    const p = JSON.parse(localStorage.getItem('fb_profile') || '{}');
    return !!(p.age && p.weight && p.height && p.fitnessLevel && p.goals);
  } catch (_) { return false; }
}

function getWaterGlasses() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const water = JSON.parse(localStorage.getItem('fb_water') || '{}');
    return water[today] || 0;
  } catch (_) { return 0; }
}

// ── Check & Unlock ───────────────────────────────────────────────────────
function checkAchievements() {
  let unlocked = [];
  try {
    const stored = JSON.parse(localStorage.getItem('fb_achievements') || '{}');
    for (const def of ACHIEVEMENT_DEFS) {
      if (!stored[def.id] && def.check()) {
        stored[def.id] = { unlockedAt: new Date().toISOString(), new: true };
        unlocked.push(def);
      }
    }
    localStorage.setItem('fb_achievements', JSON.stringify(stored));
  } catch (_) {}
  return unlocked;
}

function getUnlockedIds() {
  try {
    return JSON.parse(localStorage.getItem('fb_achievements') || '{}');
  } catch (_) { return {}; }
}

function markAchievementsSeen() {
  try {
    const stored = JSON.parse(localStorage.getItem('fb_achievements') || '{}');
    for (const k of Object.keys(stored)) stored[k].new = false;
    localStorage.setItem('fb_achievements', JSON.stringify(stored));
  } catch (_) {}
}

// ── Render ───────────────────────────────────────────────────────────────
function renderAchievements() {
  const container = document.getElementById('achievements-grid');
  if (!container) return;

  const unlocked = getUnlockedIds();
  const newlyUnlocked = checkAchievements();

  // Show toast for new achievements
  if (newlyUnlocked.length && typeof showToast === 'function') {
    newlyUnlocked.forEach(a => {
      setTimeout(() => showToast(`🏆 Achievement unlocked: ${a.title}!`, 'success'), 300);
    });
  }

  const allUnlocked = getUnlockedIds();

  const tierColors = {
    bronze: 'var(--coral)',
    silver: '#a8b8d8',
    gold: 'var(--yellow)',
    platinum: 'var(--purple)',
  };
  const tierGlows = {
    bronze: 'rgba(255,107,53,0.15)',
    silver: 'rgba(168,184,216,0.1)',
    gold: 'rgba(249,199,79,0.15)',
    platinum: 'rgba(155,93,229,0.15)',
  };

  const unlockedCount = Object.keys(allUnlocked).length;
  const totalCount = ACHIEVEMENT_DEFS.length;

  // Update counter
  const counter = document.getElementById('achievements-counter');
  if (counter) counter.textContent = `${unlockedCount} / ${totalCount}`;

  container.innerHTML = ACHIEVEMENT_DEFS.map(def => {
    const isUnlocked = !!allUnlocked[def.id];
    const isNew = allUnlocked[def.id]?.new;
    const color = tierColors[def.tier] || 'var(--blue-primary)';
    const glow = tierGlows[def.tier] || 'rgba(79,142,247,0.1)';

    return `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${isNew ? 'new-achievement' : ''}"
           style="${isUnlocked ? `--ach-color:${color};--ach-glow:${glow};` : ''}">
        <div class="ach-icon">${isUnlocked ? def.icon : '🔒'}</div>
        <div class="ach-info">
          <div class="ach-title">${def.title}</div>
          <div class="ach-desc">${def.desc}</div>
          <div class="ach-tier ${def.tier}">${def.tier}</div>
        </div>
        ${isNew ? '<div class="ach-new-badge">NEW</div>' : ''}
      </div>`;
  }).join('');

  // Mark as seen after render
  setTimeout(markAchievementsSeen, 2000);
}

function initAchievements() {
  checkAchievements();
  renderAchievements();
}

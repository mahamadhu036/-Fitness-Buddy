/**
 * Fitness Buddy — Main App Controller v2
 * Navigation, chat, profile with BMI/TDEE, particles, toast, markdown
 */

'use strict';

// ── BMI & TDEE Calculations ────────────────────────────────────────────
function calculateBMI(weight, height) {
  if (!weight || !height || height === 0) return null;
  const h = height / 100; // cm → m
  const bmi = weight / (h * h);
  return Math.round(bmi * 10) / 10;
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal weight';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
}

/**
 * Mifflin-St Jeor formula for TDEE estimation
 * activityLevel: 1.2 (sedentary) → 1.725 (very active)
 */
function calculateTDEE(age, gender, weight, height, activityLevel = 1.375) {
  if (!age || !weight || !height) return null;
  // BMR
  let bmr;
  if (gender === 'female') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  }
  return Math.round(bmr * activityLevel);
}

function computeBMI() {
  const weight = parseFloat(document.getElementById('prof-weight')?.value);
  const height = parseFloat(document.getElementById('prof-height')?.value);
  const age    = parseFloat(document.getElementById('prof-age')?.value);
  const gender = document.getElementById('prof-gender')?.value || 'male';

  const banner = document.getElementById('bmi-banner');

  if (weight && height) {
    const bmi  = calculateBMI(weight, height);
    const tdee = calculateTDEE(age, gender, weight, height);
    const cat  = getBMICategory(bmi);

    if (banner) banner.style.display = 'flex';

    const bmiEl  = document.getElementById('bmi-display-val');
    const tdeeEl = document.getElementById('tdee-display-val');
    const catEl  = document.getElementById('bmi-category-text');

    if (bmiEl)  bmiEl.textContent  = bmi;
    if (tdeeEl) tdeeEl.textContent = tdee ? tdee.toLocaleString() : '—';
    if (catEl)  catEl.textContent  = cat;

    // Color the BMI category
    if (catEl) {
      catEl.style.color =
        cat === 'Normal weight' ? 'var(--green)' :
        cat === 'Underweight'   ? 'var(--blue-primary)' :
        cat === 'Overweight'    ? 'var(--yellow)' :
        'var(--coral)';
    }

    // Auto-set calorie goal if not manually set
    if (tdee) {
      const goalInput = document.getElementById('prof-calorie-goal');
      if (goalInput && !goalInput.dataset.manuallySet) {
        const goal = document.getElementById('prof-goal')?.value || 'stay active';
        const adj = goal === 'weight loss' ? tdee - 400 :
                    goal === 'muscle gain' ? tdee + 300 : tdee;
        goalInput.value = adj;
      }
    }
  } else {
    if (banner) banner.style.display = 'none';
  }
}

// ── Profile ────────────────────────────────────────────────────────────
function getProfile() {
  try {
    return JSON.parse(localStorage.getItem('fb_profile') || '{}');
  } catch (_) { return {}; }
}

function saveProfile() {
  const weight = parseFloat(document.getElementById('prof-weight')?.value) || null;
  const height = parseFloat(document.getElementById('prof-height')?.value) || null;
  const age    = parseFloat(document.getElementById('prof-age')?.value)    || null;
  const gender = document.getElementById('prof-gender')?.value || 'male';
  const name   = (document.getElementById('prof-name')?.value || '').trim();

  const bmi  = calculateBMI(weight, height);
  const tdee = calculateTDEE(age, gender, weight, height);

  const profile = {
    name,
    age,
    gender,
    weight,
    height,
    bmi,
    bmiCategory: bmi ? getBMICategory(bmi) : null,
    tdee,
    fitnessLevel:      document.getElementById('prof-level')?.value || 'beginner',
    goals:             document.getElementById('prof-goal')?.value  || 'stay active',
    equipment:         document.getElementById('prof-equipment')?.value || 'no equipment',
    diet:              document.getElementById('prof-diet')?.value  || 'no preference',
    medicalConditions: document.getElementById('prof-medical')?.value || '',
    calorieGoal:       parseInt(document.getElementById('prof-calorie-goal')?.value) || tdee || 2000,
  };

  localStorage.setItem('fb_profile', JSON.stringify(profile));

  // Store BMI separately for achievement check
  if (bmi) localStorage.setItem('fb_bmi', bmi.toString());

  // Apply calorie goal
  if (typeof CalTracker !== 'undefined') {
    CalTracker.goal = profile.calorieGoal;
    if (typeof saveCalorieData === 'function') saveCalorieData();
    if (typeof updateCalorieUI === 'function') updateCalorieUI();
    const goalInput = document.getElementById('calorie-goal-input');
    if (goalInput) goalInput.value = profile.calorieGoal;
  }

  // Update greeting with user name
  updateWelcomeGreeting(name);

  closeProfileModal();
  const nameGreet = name ? `, ${name}` : '';
  showToast(`✅ Profile saved${nameGreet}! BMI: ${bmi || '—'} · TDEE: ${tdee ? tdee + ' kcal' : '—'}`, 'success');

  // Regenerate weekly plan when profile changes
  if (typeof generateWeeklyPlan === 'function') {
    setTimeout(() => generateWeeklyPlan(true), 500);
  }

  // Check achievements
  if (typeof checkAchievements === 'function') {
    setTimeout(() => {
      const newly = checkAchievements();
      if (newly.length && typeof renderAchievements === 'function') renderAchievements();
    }, 600);
  }
}

function loadProfileIntoModal() {
  const p = getProfile();
  const set = (id, val) => { const el = document.getElementById(id); if (el && val !== null && val !== undefined) el.value = val; };

  set('prof-name',  p.name);
  set('prof-age',    p.age);
  set('prof-gender', p.gender);
  set('prof-height', p.height);
  set('prof-weight', p.weight);
  set('prof-level',  p.fitnessLevel);
  set('prof-goal',   p.goals);
  set('prof-equipment', p.equipment);
  set('prof-diet',   p.diet);
  set('prof-medical', p.medicalConditions);
  if (p.calorieGoal) {
    const cg = document.getElementById('prof-calorie-goal');
    if (cg) { cg.value = p.calorieGoal; cg.dataset.manuallySet = 'true'; }
  }

  // Re-compute BMI display
  computeBMI();
}

function openProfileModal() {
  loadProfileIntoModal();
  document.getElementById('profile-modal').classList.add('open');
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.remove('open');
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('profile-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeProfileModal();
  });
  // Allow manual override of calorie goal
  const cgInput = document.getElementById('prof-calorie-goal');
  if (cgInput) cgInput.addEventListener('input', () => { cgInput.dataset.manuallySet = 'true'; });
});

// ── Navigation ────────────────────────────────────────────────────────
function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const viewEl = document.getElementById(`view-${view}`);
  const navEl  = document.getElementById(`nav-${view}`);

  if (viewEl) viewEl.classList.add('active');
  if (navEl)  navEl.classList.add('active');

  if (view === 'dashboard') {
    updateDashboardStats();
    if (typeof initAgent === 'function') initAgent();
    if (typeof renderAchievements === 'function') renderAchievements();
  }
  if (view === 'calories') {
    updateCalorieUI();
  }
}

// ── Chat ─────────────────────────────────────────────────────────────
const chatHistory = [];

async function sendMessage() {
  const input  = document.getElementById('chat-input');
  const msg    = input.value.trim();
  if (!msg) return;

  input.value = '';
  autoResize(input);

  // Hide welcome banner
  const banner = document.getElementById('welcome-banner');
  if (banner) banner.style.display = 'none';

  // Show user message
  appendMessage('user', msg);

  const sendBtn = document.getElementById('send-btn');
  sendBtn.disabled = true;
  const typingId = showTyping();

  try {
    const profile = getProfile();
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: chatHistory.slice(-10),
        context: profile,
      }),
    });

    const data = await res.json();
    removeTyping(typingId);

    if (data.success) {
      appendMessage('ai', data.reply);
      chatHistory.push({ role: 'user',      content: msg });
      chatHistory.push({ role: 'assistant', content: data.reply });

      // Increment chat count
      const count = parseInt(localStorage.getItem('fb_chat_count') || '0') + 1;
      localStorage.setItem('fb_chat_count', count);

      // Check achievements
      if (typeof checkAchievements === 'function') checkAchievements();
    } else {
      appendMessage('ai', '⚠️ Sorry, I had trouble with that. Could you try rephrasing your question?');
    }
  } catch (err) {
    removeTyping(typingId);
    appendMessage('ai', '⚠️ I\'m having trouble connecting right now. Please check your connection and try again.');
    showToast('Connection error. Is the server running?', 'error');
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

function sendQuick(message) {
  const input = document.getElementById('chat-input');
  input.value = message;
  navigate('chat');
  setTimeout(sendMessage, 100);
}

// ── Chat Toolbar Actions ──────────────────────────────────────────────
function clearChat() {
  const btn = document.querySelector('.chat-tool-btn.delete');

  // Two-click pattern: first click asks "Sure?", second click clears
  if (btn && btn.dataset.confirming !== 'true') {
    btn.dataset.confirming = 'true';
    btn.style.borderColor = 'var(--coral)';
    btn.style.color = 'var(--coral)';
    btn.style.background = 'rgba(255,107,53,0.12)';
    btn.innerHTML = '⚠️ <span>Sure?</span>';

    // Auto-cancel after 3s if not clicked again
    setTimeout(() => {
      if (btn.dataset.confirming === 'true') {
        btn.dataset.confirming = '';
        btn.style.cssText = '';
        btn.innerHTML = '🗑️ <span>Clear</span>';
      }
    }, 3000);
    return;
  }

  // Second click — do the clear
  if (btn) {
    btn.dataset.confirming = '';
    btn.style.cssText = '';
    btn.innerHTML = '🗑️ <span>Clear</span>';
  }

  const container = document.getElementById('chat-messages');
  container.innerHTML = '';

  // Re-show welcome banner with personalised name
  const profile = getProfile();
  const name = profile.name || '';
  const banner = document.createElement('div');
  banner.className = 'welcome-banner';
  banner.id = 'welcome-banner';
  banner.innerHTML = `
    <div class="welcome-avatar">🤖</div>
    <h2>${name ? 'Hey ' + name + ", I'm Buddy! 👋" : "Hey there, I'm Buddy! 👋"}</h2>
    <p>Your personal AI fitness coach. Tell me your age, weight, height, and goal — I'll create a plan <strong>just for you</strong>!</p>
    <p style="margin-top:12px;font-size:0.82rem;color:var(--text-muted)">💡 Tip: Complete your profile (👤 top right) for fully personalized advice</p>
  `;
  container.appendChild(banner);

  // Clear history array
  chatHistory.length = 0;

  showToast('🗑️ Chat cleared!', 'info');
}

function refreshChat() {
  const container = document.getElementById('chat-messages');
  const banner = document.getElementById('welcome-banner');

  // Animate the container
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.3s ease';

  setTimeout(() => {
    // Update welcome banner name if profile was updated
    const profile = getProfile();
    if (banner) {
      const h2 = banner.querySelector('h2');
      if (h2 && profile.name) h2.textContent = `Hey ${profile.name}, I'm Buddy! 👋`;
    }
    container.style.opacity = '1';
    showToast('🔄 Chat refreshed!', 'info');
  }, 300);
}

function appendMessage(role, content) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `message ${role}`;

  const avatar = role === 'ai' ? '🤖' : '👤';
  div.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div class="msg-content">${role === 'ai' ? renderMarkdown(content) : escapeHtml(content)}</div>
  `;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  const id  = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = id;
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="typing-dots"><span></span><span></span><span></span></div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function handleInputKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ── Markdown Renderer ─────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  let html = String(text);

  // Escape HTML first (XSS prevention)
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```[\s\S]*?```/g, m => {
    const code = m.slice(3, -3).replace(/^\w+\n/, '');
    return `<pre><code>${code}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,   '<h1>$1</h1>');

  // Bold / italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g,     '<em>$1</em>');

  // Tables
  html = html.replace(/((?:\|.+\|\n?)+)/g, (match) => {
    const rows = match.trim().split('\n');
    if (rows.length < 2) return match;
    let table = '<table>';
    rows.forEach((row, i) => {
      if (/^\|[-| :]+\|$/.test(row.trim())) return; // separator row
      const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1);
      const tag = i === 0 ? 'th' : 'td';
      table += `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
    });
    table += '</table>';
    return table;
  });

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // HR
  html = html.replace(/^---$/gm, '<hr>');

  // Unordered lists
  html = html.replace(/((?:^[•\-\*] .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^[•\-\*] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Paragraphs
  html = html.replace(/^(?!<[houptbl]|<\/|```)(.*\S.*)$/gm, (m) => `<p>${m}</p>`);

  // Clean up blank lines
  html = html.replace(/\n\n+/g, '\n');

  return html;
}

// ── Toast Notifications ───────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Particles ─────────────────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 25;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 8}s;
      animation-duration: ${6 + Math.random() * 6}s;
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
      background: ${Math.random() > 0.5 ? 'var(--blue-primary)' : 'var(--coral)'};
      opacity: ${0.2 + Math.random() * 0.4};
    `;
    container.appendChild(p);
  }
}

// ── Utility ───────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Weekly Chart Refresh ─────────────────────────────────────────────
function refreshWeeklyChart() {
  const btn = document.querySelector('[onclick="refreshWeeklyChart()"]');
  if (btn) {
    btn.textContent = '⏳ Loading...';
    btn.disabled = true;
  }
  setTimeout(() => {
    if (typeof renderWeekChart === 'function') renderWeekChart();
    if (typeof updateCalorieUI === 'function') updateCalorieUI();
    if (btn) {
      btn.textContent = '🔄 Refresh';
      btn.disabled = false;
    }
    if (typeof showToast === 'function') showToast('📈 Chart refreshed!', 'info');
  }, 350);
}

// ── Welcome Greeting ─────────────────────────────────────────────────
function updateWelcomeGreeting(name) {
  const banner = document.getElementById('welcome-banner');
  if (!banner) return;
  const h2 = banner.querySelector('h2');
  if (h2) h2.textContent = name ? `Hey ${name}, I'm Buddy! 👋` : `Hey there, I'm Buddy! 👋`;
}

// ── App Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCalorieTracker();
  initWorkoutPlanner();
  initDashboard();
  if (typeof initAchievements === 'function') initAchievements();

  // Apply profile calorie goal on load
  const profile = getProfile();
  if (profile.calorieGoal && typeof CalTracker !== 'undefined') {
    CalTracker.goal = profile.calorieGoal;
    const goalInput = document.getElementById('calorie-goal-input');
    if (goalInput) goalInput.value = profile.calorieGoal;
    if (typeof updateCalorieUI === 'function') updateCalorieUI();
  }

  // Greet returning user by name
  if (profile.name) updateWelcomeGreeting(profile.name);

  // Show profile modal on first visit
  if (!localStorage.getItem('fb_profile')) {
    setTimeout(openProfileModal, 1200);
  }

  // Update streak on daily visit
  updateStreak();

  // Focus chat input
  const chatInput = document.getElementById('chat-input');
  if (chatInput) chatInput.focus();

  console.log('🏋️ Fitness Buddy v2 initialized!');
});

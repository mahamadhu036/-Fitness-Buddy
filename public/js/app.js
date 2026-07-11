/**
 * Fitness Buddy — Main App Controller
 * Navigation, chat, profile, particles, toast, markdown rendering
 */

'use strict';

// ── Profile ────────────────────────────────────────────
function getProfile() {
  try {
    return JSON.parse(localStorage.getItem('fb_profile') || '{}');
  } catch (_) { return {}; }
}

function saveProfile() {
  const profile = {
    fitnessLevel: document.getElementById('prof-level').value,
    goals:        document.getElementById('prof-goal').value,
    equipment:    document.getElementById('prof-equipment').value,
    diet:         document.getElementById('prof-diet').value,
    calorieGoal:  parseInt(document.getElementById('prof-calorie-goal').value) || 2000,
  };
  localStorage.setItem('fb_profile', JSON.stringify(profile));

  // Apply calorie goal
  if (typeof CalTracker !== 'undefined') {
    CalTracker.goal = profile.calorieGoal;
    if (typeof saveCalorieData === 'function') saveCalorieData();
    if (typeof updateCalorieUI === 'function') updateCalorieUI();
    const goalInput = document.getElementById('calorie-goal-input');
    if (goalInput) goalInput.value = profile.calorieGoal;
  }

  closeProfileModal();
  showToast('✅ Profile saved! Buddy will personalize advice for you.', 'success');
}

function loadProfileIntoModal() {
  const p = getProfile();
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  set('prof-level', p.fitnessLevel);
  set('prof-goal', p.goals);
  set('prof-equipment', p.equipment);
  set('prof-diet', p.diet);
  if (p.calorieGoal) document.getElementById('prof-calorie-goal').value = p.calorieGoal;
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
});

// ── Navigation ────────────────────────────────────────
function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const viewEl = document.getElementById(`view-${view}`);
  const navEl = document.getElementById(`nav-${view}`);

  if (viewEl) viewEl.classList.add('active');
  if (navEl) navEl.classList.add('active');

  if (view === 'dashboard') {
    updateDashboardStats();
  }
  if (view === 'calories') {
    updateCalorieUI();
  }
}

// ── Chat ─────────────────────────────────────────────
const chatHistory = [];

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  autoResize(input);

  // Hide welcome banner
  const banner = document.getElementById('welcome-banner');
  if (banner) banner.style.display = 'none';

  // Show user message
  appendMessage('user', msg);

  // Disable send
  const sendBtn = document.getElementById('send-btn');
  sendBtn.disabled = true;

  // Show typing indicator
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
      chatHistory.push({ role: 'user', content: msg });
      chatHistory.push({ role: 'assistant', content: data.reply });

      // Increment chat count
      const count = parseInt(localStorage.getItem('fb_chat_count') || '0') + 1;
      localStorage.setItem('fb_chat_count', count);
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
  const id = 'typing-' + Date.now();
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

// ── Markdown Renderer ─────────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  let html = String(text);

  // Escape HTML first (to prevent XSS)
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Code blocks (before other processing)
  html = html.replace(/```[\s\S]*?```/g, m => {
    const code = m.slice(3, -3).replace(/^\w+\n/, '');
    return `<pre><code>${code}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold / italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

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

  // Paragraphs — wrap remaining lines
  html = html.replace(/^(?!<[houptbl]|<\/|```)(.*\S.*)$/gm, (m) => `<p>${m}</p>`);

  // Clean up blank lines between block elements
  html = html.replace(/\n\n+/g, '\n');

  return html;
}

// ── Toast Notifications ───────────────────────────────
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
  }, 3000);
}

// ── Particles ─────────────────────────────────────────
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

// ── Utility ───────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── App Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  initParticles();
  initCalorieTracker();
  initWorkoutPlanner();
  initDashboard();

  // Apply profile calorie goal on load
  const profile = getProfile();
  if (profile.calorieGoal && typeof CalTracker !== 'undefined') {
    CalTracker.goal = profile.calorieGoal;
    const goalInput = document.getElementById('calorie-goal-input');
    if (goalInput) goalInput.value = profile.calorieGoal;
    if (typeof updateCalorieUI === 'function') updateCalorieUI();
  }

  // Show profile modal on first visit
  if (!localStorage.getItem('fb_profile')) {
    setTimeout(openProfileModal, 1000);
  }

  // Update streak on daily visit
  updateStreak();

  // Focus chat input
  const chatInput = document.getElementById('chat-input');
  if (chatInput) chatInput.focus();

  console.log('🏋️ Fitness Buddy initialized!');
});

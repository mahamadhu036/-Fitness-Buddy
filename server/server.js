'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const chatRoutes  = require('./routes/chat.routes');
const agentRoutes = require('./routes/agent.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Visitor Analytics (in-memory) ─────────────────────────────────────────────
const analytics = {
  totalVisits: 0,
  uniqueIPs: new Set(),
  activeSessions: new Set(),
  chatRequests: 0,
  agentRequests: 0,
  startTime: new Date(),
  recentVisits: [], // last 20 visits
};

// Visitor tracking middleware
function trackVisitor(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown';
  const ua = req.headers['user-agent'] || '';
  const sessionId = req.headers['x-session-id'] || ip;

  analytics.totalVisits++;
  analytics.uniqueIPs.add(ip);
  analytics.activeSessions.add(sessionId);

  analytics.recentVisits.unshift({
    time: new Date().toISOString(),
    ip: ip.replace(/\.\d+$/, '.***'), // mask last octet for privacy
    path: req.path,
    device: /mobile|android|iphone/i.test(ua) ? 'Mobile' : 'Desktop',
  });
  if (analytics.recentVisits.length > 20) analytics.recentVisits.pop();

  // Count API usage
  if (req.path.startsWith('/api/chat')) analytics.chatRequests++;
  if (req.path.startsWith('/api/agent')) analytics.agentRequests++;

  next();
}

// Security & parsing middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply visitor tracking to all routes
app.use(trackVisitor);

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Stats API endpoint ─────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - analytics.startTime) / 1000);
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  res.json({
    totalVisits: analytics.totalVisits,
    uniqueVisitors: analytics.uniqueIPs.size,
    activeSessions: analytics.activeSessions.size,
    chatRequests: analytics.chatRequests,
    agentRequests: analytics.agentRequests,
    uptime: `${hours}h ${minutes}m`,
    serverStart: analytics.startTime.toISOString(),
    recentVisits: analytics.recentVisits.slice(0, 10),
  });
});

// API routes
app.use('/api', chatRoutes);
app.use('/api/agent', agentRoutes);

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════╗
  ║   🏋️  Fitness Buddy AI Coach     ║
  ║   Server running on port ${PORT}   ║
  ║   http://localhost:${PORT}         ║
  ╚══════════════════════════════════╝
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = parseInt(PORT) + 1;
    console.warn(`\n⚠️  Port ${PORT} is already in use.`);
    console.warn(`   Trying port ${nextPort} instead...\n`);
    app.listen(nextPort, () => {
      console.log(`
  ╔══════════════════════════════════╗
  ║   🏋️  Fitness Buddy AI Coach     ║
  ║   Server running on port ${nextPort}   ║
  ║   http://localhost:${nextPort}         ║
  ╚══════════════════════════════════╝
      `);
    });
  } else {
    console.error('[Server] Fatal error:', err.message);
    process.exit(1);
  }
});

module.exports = app;

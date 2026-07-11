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

// Security & parsing middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

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

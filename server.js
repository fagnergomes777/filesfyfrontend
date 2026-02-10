#!/usr/bin/env node

/**
 * Servidor Web Filesfy
 * Serve a aplicação web responsiva
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.WEB_PORT || 3000;
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Proxy para API (opcional - se backend não estiver acessível diretamente)
app.use('/api/proxy', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${API_URL}${req.url.replace('/proxy', '')}`, {
      method: req.method,
      headers: {
        ...req.headers,
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SPA fallback - serve index.html para todas as rotas não encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🌐 Servidor Web rodando em http://localhost:${PORT}`);
  console.log(`📡 API Backend: ${API_URL}`);
  console.log(`🔌 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Encerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

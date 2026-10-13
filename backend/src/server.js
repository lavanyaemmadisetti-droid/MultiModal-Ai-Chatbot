// Initialize environment variables first before importing routes or services
import './config/env.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import uploadRoutes from './routes/uploadRoutes.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isGeminiConfigured } from './config/gemini.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Universal CORS configuration (supports local dev, Vercel frontend, and Render)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Range');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Reflect requesting origin to allow Vercel previews & production
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Range']
  })
);

app.options('*', cors());

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Multimodal AI StudyMate Backend API is running.',
    docs: '/api/health',
    geminiConfigured: isGeminiConfigured()
  });
});

// Explicitly mount upload routes at /upload and /api/upload
app.use('/upload', uploadRoutes);
app.use('/api/upload', uploadRoutes);

// Mount API router for all features (/chat, /summarize, /quiz, /health)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`
  });
});

// Centralized error handling
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Multimodal AI StudyMate Backend running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   Gemini Status: ${isGeminiConfigured() ? '✅ Configured' : '⚠️ Key not set (using demo mode)'}`);
  console.log(`==================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`   To resolve, close the running process or change PORT in backend/.env.\n`);
  } else {
    console.error('\n❌ Server error:', err.message);
  }
});

export default app;

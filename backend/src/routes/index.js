import { Router } from 'express';
import uploadRoutes from './uploadRoutes.js';
import chatRoutes from './chatRoutes.js';
import summaryRoutes from './summaryRoutes.js';
import quizRoutes from './quizRoutes.js';
import { isGeminiConfigured } from '../config/gemini.js';
import { isSupabaseConfigured } from '../config/supabase.js';

const router = Router();

// Health & System Status Endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Multimodal AI StudyMate Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: isGeminiConfigured(),
    supabaseConfigured: isSupabaseConfigured(),
    features: {
      multimodalQA: true,
      documentSummarizer: true,
      quizGenerator: true,
      flashcardGenerator: true,
      supabasePersistence: isSupabaseConfigured()
    }
  });
});

// Feature routers
router.use('/upload', uploadRoutes);
router.use('/chat', chatRoutes);
router.use('/summarize', summaryRoutes);
router.use('/quiz', quizRoutes);

export default router;

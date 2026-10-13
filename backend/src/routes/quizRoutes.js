import { Router } from 'express';
import {
  handleGenerateQuiz,
  handleGenerateFlashcards,
  handleSaveQuizResult,
  handleGetQuizResults
} from '../controllers/quizController.js';

const router = Router();

router.post('/generate', handleGenerateQuiz);
router.post('/flashcards', handleGenerateFlashcards);
router.post('/save-result', handleSaveQuizResult);
router.get('/history/:documentId', handleGetQuizResults);

export default router;

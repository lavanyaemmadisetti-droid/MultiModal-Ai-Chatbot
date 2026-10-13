import { Router } from 'express';
import { handleSummarize, handleGetSummaries } from '../controllers/summaryController.js';

const router = Router();

router.post('/', handleSummarize);
router.get('/history/:documentId', handleGetSummaries);

export default router;

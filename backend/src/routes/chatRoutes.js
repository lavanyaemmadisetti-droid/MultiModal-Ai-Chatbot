import { Router } from 'express';
import { handleChat, handleGetChatHistory } from '../controllers/chatController.js';

const router = Router();

router.post('/', handleChat);
router.get('/history/:documentId', handleGetChatHistory);

export default router;

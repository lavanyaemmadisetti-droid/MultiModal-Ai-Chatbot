import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  handleFileUpload,
  handleGetDocument,
  handleGetSampleDocuments,
  handleGetSavedDocuments,
  handleSupabaseUpload
} from '../controllers/uploadController.js';

const router = Router();

router.post('/', upload.single('file'), handleFileUpload);
router.post('/supabase', handleSupabaseUpload);
router.get('/samples', handleGetSampleDocuments);
router.get('/saved', handleGetSavedDocuments);
router.get('/:id', handleGetDocument);

export default router;

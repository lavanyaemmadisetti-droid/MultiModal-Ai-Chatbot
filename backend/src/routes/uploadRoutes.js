import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  handleFileUpload,
  handleGetDocument,
  handleGetSampleDocuments,
  handleGetSavedDocuments
} from '../controllers/uploadController.js';

const router = Router();

router.post('/', upload.single('file'), handleFileUpload);
router.get('/samples', handleGetSampleDocuments);
router.get('/saved', handleGetSavedDocuments);
router.get('/:id', handleGetDocument);

export default router;

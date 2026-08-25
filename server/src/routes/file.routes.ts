import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/file.controller.js';
import { requireAuth } from '../middleware/index.js';
import { MAX_FILE_SIZE_BYTES } from '../services/storage.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

const router = Router();

router.post('/upload', requireAuth, upload.single('file'), FileController.uploadFile);
router.get('/:id', requireAuth, FileController.getFile);
router.delete('/:id', requireAuth, FileController.deleteFile);

export default router;

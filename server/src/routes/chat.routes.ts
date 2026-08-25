import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/index.js';

const router = Router();

router.get('/conversations', requireAuth, ChatController.getConversations);
router.post('/conversations', requireAuth, ChatController.startConversation);
router.get('/conversations/:id/messages', requireAuth, ChatController.getMessages);
router.post('/conversations/:id/messages', requireAuth, ChatController.sendMessage);
router.post('/conversations/:id/read', requireAuth, ChatController.markRead);

export default router;

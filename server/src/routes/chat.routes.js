import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', ChatController.getConversations);
router.get('/conversations', ChatController.getConversations);
router.get('/:conversationId/messages', ChatController.getMessages);
router.get('/conversations/:conversationId/messages', ChatController.getMessages);
router.post('/messages', upload.single('file'), ChatController.sendMessage);
router.post('/:conversationId/messages', upload.single('file'), (req, res, next) => {
  req.body.conversationId = req.params.conversationId;
  ChatController.sendMessage(req, res, next);
});
router.get('/conversations/recipient/:recipientId', ChatController.getOrCreateConversation);
router.get('/recipient/:recipientId', ChatController.getOrCreateConversation);

export default router;

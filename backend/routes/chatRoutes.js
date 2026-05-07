import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import { getConversations, getMessages, sendMessage, createConversation } from '../controllers/chatController.js'

const router = express.Router()

router.get('/conversations', verifyToken, getConversations)
router.get('/messages/:conversationId', verifyToken, getMessages)
router.post('/message', verifyToken, sendMessage)
router.post('/conversation', verifyToken, createConversation)

export default router
import { db } from '../db.js'

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.user_id
    const userRole = req.user.role

    let query
    let params

    if (userRole === 'farmer') {
      query = `
        SELECT 
          c.conversation_id,
          c.crop_order_id,
          c.created_at,
          c.last_message_at,
          u.user_id,
          u.firstname,
          u.lastname,
          (SELECT content FROM messages WHERE conversation_id = c.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT COUNT(*) FROM messages WHERE conversation_id = c.conversation_id AND sender_type = 'user' AND is_read = false) as unread_count
        FROM conversations c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.farmer_id = $1
        ORDER BY c.last_message_at DESC
      `
      params = [userId]
    } else {
      query = `
        SELECT 
          c.conversation_id,
          c.crop_order_id,
          c.created_at,
          c.last_message_at,
          f.user_id as farmer_id,
          f.firstname,
          f.lastname,
          (SELECT content FROM messages WHERE conversation_id = c.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT COUNT(*) FROM messages WHERE conversation_id = c.conversation_id AND sender_type = 'farmer' AND is_read = false) as unread_count
        FROM conversations c
        JOIN farmer f ON c.farmer_id = f.user_id
        WHERE c.user_id = $1
        ORDER BY c.last_message_at DESC
      `
      params = [userId]
    }

    const result = await db.query(query, params)
    res.json({ success: true, conversations: result.rows })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ success: false, message: 'Failed to get conversations' })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user.user_id
    const userRole = req.user.role

    const convCheck = await db.query(
      'SELECT user_id, farmer_id FROM conversations WHERE conversation_id = $1',
      [conversationId]
    )

    if (convCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found' })
    }

    const conv = convCheck.rows[0]
    if (conv.user_id !== userId && conv.farmer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    await db.query(
      'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_type != $2',
      [conversationId, userRole]
    )

    const result = await db.query(
      `SELECT m.message_id, m.sender_id, m.sender_type, m.content, m.is_read, m.created_at
       FROM messages m
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [conversationId]
    )

    res.json({ success: true, messages: result.rows })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ success: false, message: 'Failed to get messages' })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body
    const senderId = req.user.user_id
    const senderRole = req.user.role

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' })
    }

    let conversationIdToUse = conversationId

    if (!conversationIdToUse) {
      const { farmerId, orderId } = req.body
      
      const existingConv = await db.query(
        'SELECT conversation_id FROM conversations WHERE user_id = $1 AND farmer_id = $2 AND crop_order_id = $3',
        [senderId, farmerId, orderId || null]
      )

      if (existingConv.rows.length > 0) {
        conversationIdToUse = existingConv.rows[0].conversation_id
      } else {
        const newConv = await db.query(
          `INSERT INTO conversations (user_id, farmer_id, crop_order_id)
           VALUES ($1, $2, $3)
           RETURNING conversation_id`,
          [senderId, farmerId, orderId || null]
        )
        conversationIdToUse = newConv.rows[0].conversation_id
      }
    }

    const result = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, sender_type, content)
       VALUES ($1, $2, $3, $4)
       RETURNING message_id, conversation_id, sender_id, sender_type, content, is_read, created_at`,
      [conversationIdToUse, senderId, senderRole, content.trim()]
    )

    await db.query(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = $1',
      [conversationIdToUse]
    )

    const io = req.app.get('io')
    if (io) {
      const conv = await db.query('SELECT user_id, farmer_id FROM conversations WHERE conversation_id = $1', [conversationIdToUse])
      const recipients = conv.rows[0]
      
      io.to(`user_${recipients.user_id}`).emit('new_message', result.rows[0])
      io.to(`farmer_${recipients.farmer_id}`).emit('new_message', result.rows[0])
    }

    res.json({ success: true, message: result.rows[0] })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ success: false, message: 'Failed to send message' })
  }
}

export const createConversation = async (req, res) => {
  try {
    const { farmerId, orderId } = req.body
    const userId = req.user.user_id

    if (!farmerId) {
      return res.status(400).json({ success: false, message: 'Farmer ID is required' })
    }

    const existingConv = await db.query(
      'SELECT conversation_id FROM conversations WHERE user_id = $1 AND farmer_id = $2 AND (crop_order_id = $3 OR ($3 IS NULL AND crop_order_id IS NULL))',
      [userId, farmerId, orderId || null]
    )

    if (existingConv.rows.length > 0) {
      return res.json({ success: true, conversation_id: existingConv.rows[0].conversation_id, existing: true })
    }

    const result = await db.query(
      `INSERT INTO conversations (user_id, farmer_id, crop_order_id)
       VALUES ($1, $2, $3)
       RETURNING conversation_id`,
      [userId, farmerId, orderId || null]
    )

    res.json({ success: true, conversation_id: result.rows[0].conversation_id, existing: false })
  } catch (error) {
    console.error('Create conversation error:', error)
    res.status(500).json({ success: false, message: 'Failed to create conversation' })
  }
}
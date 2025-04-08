const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');

// POST /api/chat
router.post('/', async (req, res) => {
  const { message, userId, sessionId } = req.body;

  // Simulated AI reply (replace with real AI integration)
  const aiReply = `Echo: ${message}`;

  try {
    let chat;

    if (sessionId) {
      // Add to existing session
      chat = await ChatSession.findById(sessionId);
      if (!chat) return res.status(404).json({ error: 'Session not found' });

      chat.messages.push({ role: 'user', content: message });
      chat.messages.push({ role: 'ai', content: aiReply });
      await chat.save();
    } else {
      // Create new session
      chat = new ChatSession({
        userId,
        messages: [
          { role: 'user', content: message },
          { role: 'ai', content: aiReply },
        ],
      });
      await chat.save();
    }

    res.json({
      reply: aiReply,
      sessionId: chat._id,
    });
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/chat/sessions?userId=...
router.get('/sessions', async (req, res) => {
  try {
    const { userId } = req.query;
    const sessions = await ChatSession.find({ userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

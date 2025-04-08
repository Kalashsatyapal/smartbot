const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const axios = require('axios');

router.post('/', async (req, res) => {
  const { userId, message } = req.body;

  try {
    const aiRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-small-3.1-24b-instruct:free',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiReply = aiRes.data.choices[0].message.content;

    let chat = await Chat.findOne({ userId }).sort({ createdAt: -1 });

    if (chat) {
      chat.messages.push({ role: 'user', content: message });
      chat.messages.push({ role: 'assistant', content: aiReply });
      await chat.save();
    } else {
      chat = await Chat.create({
        userId,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: aiReply },
        ],
      });
    }

    res.json({ reply: aiReply });
  } catch (err) {
    console.error('AI Error:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'AI Error' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const chat = await Chat.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'History fetch error' });
  }
});

module.exports = router;

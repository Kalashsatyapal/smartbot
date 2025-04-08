const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string.' });
  }
  try {
    const openrouterRes = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-small-3.1-24b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful and friendly AI assistant.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000/',
          'X-Title': 'Next.js AI Chatbot',
        },
      }
    );

    const reply = openrouterRes.data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('Invalid AI response format');
    }

    res.json({ reply });
  } catch (error) {
    console.error('OpenRouter Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get response from AI',
    });
  }
});

module.exports = router;

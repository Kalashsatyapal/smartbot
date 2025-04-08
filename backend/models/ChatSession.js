const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
});

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);

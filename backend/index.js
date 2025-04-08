const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const chatRoute = require('./routes/chat');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/chat', chatRoute);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend at http://localhost:${PORT}`));


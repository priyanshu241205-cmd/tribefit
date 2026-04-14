const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/period', require('./routes/periodRoutes'));
app.use('/api/workout', require('./routes/workoutRoutes'));
app.use('/api/sleep', require('./routes/sleepRoutes'));
app.use('/api/weight', require('./routes/weightRoutes'));
app.use('/api/calories', require('./routes/calorieRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tribefit')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

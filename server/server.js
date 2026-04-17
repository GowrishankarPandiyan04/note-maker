const express = require('express');
const cors = require('cors');
const path = require("path");
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const topicRoutes = require('./routes/topicRoutes');
const noteRoutes = require("./routes/noteRoutes");
const chatRoutes  = require("./routes/chat");

// Models
const { User } = require('./models/user');

// Connect to database
db();

// Route middlewares
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root
app.get('/', (_req, res) => res.status(200).send('API is running...'));

// Get current logged-in user info
const authMiddleware = require('./middleware/auth');
app.get('/api/me', authMiddleware, async (req, res) => {
  const me = await User.findById(req.user.id).select('-passwordHash');
  if (!me) return res.status(404).send('User not found.');
  res.status(200).send(me);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

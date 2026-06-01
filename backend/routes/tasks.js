const router = require('express').Router();
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all tasks
router.get('/', auth, async (req, res) => {
  const tasks = await Task.find({ user: req.user.id });
  res.json(tasks);
});

// Create task
router.post('/', auth, async (req, res) => {
  const task = await Task.create({ ...req.body, user: req.user.id });
  res.json(task);
});

// Update task
router.put('/:id', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
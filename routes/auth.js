const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const SECRET_KEY = 'super-secret-key';

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email })) return res.status(400).json({ msg: "Email already exists" });
    const user = new User({ name, email, password });
    await user.save();
    res.json({ msg: "Signup successful" });
  } catch {
    res.status(500).json({ msg: "Signup failed" });
  }
});

// Admin registration (one-time setup)
router.post('/admin-signup', async (req, res) => {
  const { name, email, password, adminKey } = req.body;
  try {
    // Simple admin key verification (in production, use environment variables)
    if (adminKey !== 'ADMIN_SECRET_2024') {
      return res.status(403).json({ msg: "Invalid admin key" });
    }
    
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: "Email already exists" });
    }
    
    const user = new User({ name, email, password, role: 'admin' });
    await user.save();
    res.json({ msg: "Admin account created successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Admin signup failed" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.validatePassword(password)))
    return res.status(401).json({ msg: "Invalid credentials" });
  const token = jwt.sign({ id: user._id, email, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '3h' });
  res.json({ msg: "Login successful", token, role: user.role, name: user.name });
});

module.exports = router;

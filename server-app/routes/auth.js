// User Authorization Routes
const express = require('express');
const router = express.Router();
const User = require('../schemas/User');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    const normalizedEmail = typeof email === 'string' ? email.toLowerCase() : email;

    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      username,
      email: normalizedEmail,
      password,
      firstName,
      lastName,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT);

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login (accepts either email or username as identifier)
router.post('/login', async (req, res) => {
  try {
    const identifier = req.body.identifier ?? req.body.email ?? req.body.username;
    const password = req.body.password;

    if (!identifier || !password) return res.status(400).json({ message: 'Missing credentials' });

    let user = null;
    if (typeof identifier === 'string' && identifier.includes('@')) {
      const normalizedEmail = identifier.toLowerCase();
      user = await User.findOne({ email: normalizedEmail });
    } else {
      // case-insensitive username lookup
      const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await User.findOne({ username: new RegExp(`^${escaped}$`, 'i') });
    }

    if (!user || !(await user.comparePassword(password))) {
      console.warn('Authentication failed for identifier:', identifier);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT);

    res.json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
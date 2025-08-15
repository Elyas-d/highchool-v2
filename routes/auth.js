const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models'); // Sequelize models index exports User
const { protect } = require('../middleware/auth');

// ...existing Swagger docs (register, login, me, logout) remain unchanged...

const router = express.Router();

// Shared helpers
const ISSUE_DAYS = 30;
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: `${ISSUE_DAYS}d` });

const validationHandler = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};

// @desc Register user
// @route POST /api/auth/register
// @access Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').isIn(['admin', 'teacher', 'parent', 'student']).withMessage('Invalid role')
  ],
  async (req, res) => {
    if (validationHandler(req, res)) return;
    const { name, email, password, role } = req.body;

    try {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }

      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hash,
        role,
        created_at: new Date(),
        updated_at: new Date()
      });

      const token = signToken({ id: user.id, role: user.role });
      res.status(201).json({
        success: true,
        data: {
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          token
        }
      });
    } catch (e) {
      console.error('Register error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// @desc Login user
// @route POST /api/auth/login
// @access Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    if (validationHandler(req, res)) return;
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = signToken({ id: user.id, role: user.role });
      res.json({
        success: true,
        data: {
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          token
        }
      });
    } catch (e) {
      console.error('Login error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// @desc Get current user
// @route GET /api/auth/me
// @access Private
router.get('/me', protect, async (req, res) => {
  // protect should attach req.user (id, role, etc.)
  res.json({ success: true, data: req.user });
});

// @desc Logout user (stateless JWT -> client discards token)
// @route POST /api/auth/logout
// @access Private
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;

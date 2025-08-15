const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

// ...existing Swagger docs for GET /, POST /, GET /:id, PUT /:id, DELETE /:id...

// GET /api/users (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'profile_image', 'phone', 'address', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/users (admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'teacher', 'parent', 'student'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password, role, phone, address } = req.body;

      const exists = await User.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ success: false, error: 'User with this email already exists' });
      }

      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hash,
        role,
        phone: phone || null,
        address: address || null,
        created_at: new Date(),
        updated_at: new Date()
      });

      const safe = (({ id, name: n, email: e, role: r, profile_image, phone: p, address: a, created_at }) =>
        ({ id, name: n, email: e, role: r, profile_image, phone: p, address: a, created_at }))(user);

      res.status(201).json({ success: true, data: safe });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id, 10) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to access this user data' });
    }

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'profile_image', 'phone', 'address', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/users/:id
router.put(
  '/:id',
  protect,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { id } = req.params;
      if (req.user.id !== parseInt(id, 10) && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Not authorized to update this user' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const { name, email, phone, address } = req.body;

      if (email) {
        const emailOwner = await User.findOne({ where: { email } });
        if (emailOwner && emailOwner.id !== user.id) {
          return res.status(400).json({ success: false, error: 'Email is already taken' });
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }
      updateData.updated_at = new Date();

      await user.update(updateData);

      const refreshed = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'role', 'profile_image', 'phone', 'address', 'created_at']
      });

      res.json({ success: true, data: refreshed });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// DELETE /api/users/:id (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

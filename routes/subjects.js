const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const db = require('../models');
const { Subject } = db;

const router = express.Router();

// validation helper
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};

// GET /api/subjects
router.get('/', protect, async (_req, res) => {
  try {
    const subjects = await Subject.findAll({
      attributes: ['id', 'name', 'code', 'description', 'created_at'],
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: subjects });
  } catch (e) {
    console.error('Get subjects error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/subjects (admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  [body('name').notEmpty(), body('code').notEmpty()],
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const { name, code, description } = req.body;

      const exists = await Subject.findOne({ where: { code } });
      if (exists) {
        return res.status(400).json({ success: false, error: 'Subject code already exists' });
      }

      const now = new Date();
      const subject = await Subject.create({
        name,
        code,
        description: description || null,
        created_at: now,
        updated_at: now
      });

      res.status(201).json({
        success: true,
        data: {
          id: subject.id,
          name: subject.name,
          code: subject.code,
          description: subject.description,
          created_at: subject.created_at
        }
      });
    } catch (e) {
      console.error('Create subject error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// PUT /api/subjects/:id (admin)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('name').optional().notEmpty(),
    body('code').optional().notEmpty(),
    body('description').optional()
  ],
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const { id } = req.params;
      const subject = await Subject.findByPk(id);
      if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' });

      const { name, code, description } = req.body;

      if (code) {
        const dup = await Subject.findOne({ where: { code } });
        if (dup && dup.id !== subject.id) {
          return res.status(400).json({ success: false, error: 'Subject code already exists' });
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (code !== undefined) updateData.code = code;
      if (description !== undefined) updateData.description = description;
      if (!Object.keys(updateData).length) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }
      updateData.updated_at = new Date();

      await subject.update(updateData);

      res.json({
        success: true,
        data: {
          id: subject.id,
            name: subject.name,
          code: subject.code,
          description: subject.description,
          created_at: subject.created_at
        }
      });
    } catch (e) {
      console.error('Update subject error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// DELETE /api/subjects/:id (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);
    if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' });
    await subject.destroy();
    res.json({ success: true });
  } catch (e) {
    console.error('Delete subject error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

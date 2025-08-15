const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const db = require('../models');

const { Teacher, User } = db;
const router = express.Router();

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};

// GET /api/teachers (admin)
router.get('/', protect, authorize('admin'), async (_req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'address'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({
      success: true,
      count: teachers.length,
      data: teachers.map(t => ({
        id: t.id,
        employee_id: t.employee_id,
        subject: t.subject,
        qualification: t.qualification,
        experience_years: t.experience_years,
        created_at: t.created_at,
        name: t.user?.name,
        email: t.user?.email,
        phone: t.user?.phone,
        address: t.user?.address
      }))
    });
  } catch (e) {
    console.error('Get teachers error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/teachers/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // if teacher role ensure ownership
    if (req.user.role === 'teacher') {
      const owned = await Teacher.findOne({ where: { id }, attributes: ['user_id'] });
      if (!owned || owned.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Not authorized to access this teacher data' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to access teacher data' });
    }

    const t = await Teacher.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'address'] }]
    });
    if (!t) return res.status(404).json({ success: false, error: 'Teacher not found' });

    res.json({
      success: true,
      data: {
        id: t.id,
        employee_id: t.employee_id,
        subject: t.subject,
        qualification: t.qualification,
        experience_years: t.experience_years,
        created_at: t.created_at,
        name: t.user?.name,
        email: t.user?.email,
        phone: t.user?.phone,
        address: t.user?.address
      }
    });
  } catch (e) {
    console.error('Get teacher error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/teachers (admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('user_id').isInt(),
    body('employee_id').notEmpty(),
    body('subject').notEmpty(),
    body('qualification').notEmpty(),
    body('experience_years').isInt({ min: 0 })
  ],
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const { user_id, employee_id, subject, qualification, experience_years } = req.body;

      const user = await User.findByPk(user_id, { attributes: ['id', 'role'] });
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      if (user.role !== 'teacher') {
        return res.status(400).json({ success: false, error: 'User must have teacher role' });
      }

      const dupEmp = await Teacher.findOne({ where: { employee_id } });
      if (dupEmp) return res.status(400).json({ success: false, error: 'Employee ID already exists' });

      const existing = await Teacher.findOne({ where: { user_id } });
      if (existing) return res.status(400).json({ success: false, error: 'Teacher already exists for this user' });

      const teacher = await Teacher.create({
        user_id,
        employee_id,
        subject,
        qualification,
        experience_years,
        created_at: new Date(),
        updated_at: new Date()
      });

      const full = await Teacher.findByPk(teacher.id, {
        include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'address'] }]
      });

      res.status(201).json({
        success: true,
        data: {
          id: full.id,
          employee_id: full.employee_id,
            subject: full.subject,
          qualification: full.qualification,
          experience_years: full.experience_years,
          created_at: full.created_at,
          name: full.user?.name,
          email: full.user?.email,
          phone: full.user?.phone,
          address: full.user?.address
        }
      });
    } catch (e) {
      console.error('Create teacher error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// PUT /api/teachers/:id (admin, teacher)
router.put(
  '/:id',
  protect,
  authorize('admin', 'teacher'),
  [
    body('subject').optional().notEmpty(),
    body('qualification').optional().notEmpty(),
    body('experience_years').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const { id } = req.params;
      const teacher = await Teacher.findByPk(id);
      if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });

      if (req.user.role === 'teacher' && teacher.user_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
      }

      const updateData = {};
      ['subject', 'qualification', 'experience_years'].forEach(k => {
        if (req.body[k] !== undefined) updateData[k] = req.body[k];
      });
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }
      updateData.updated_at = new Date();
      await teacher.update(updateData);

      const full = await Teacher.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'address'] }]
      });

      res.json({
        success: true,
        data: {
          id: full.id,
          employee_id: full.employee_id,
          subject: full.subject,
          qualification: full.qualification,
          experience_years: full.experience_years,
          created_at: full.created_at,
          name: full.user?.name,
          email: full.user?.email,
          phone: full.user?.phone,
          address: full.user?.address
        }
      });
    } catch (e) {
      console.error('Update teacher error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// DELETE /api/teachers/:id (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);
    if (!teacher) return res.status(404).json({ success: false, error: 'Teacher not found' });
    await teacher.destroy();
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (e) {
    console.error('Delete teacher error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

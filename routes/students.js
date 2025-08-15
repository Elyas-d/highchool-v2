const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const db = require('../models');

const { Student, User } = db;
const router = express.Router();

// helpers
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return true;
  }
  return false;
};
const studentAttributes = ['id', 'roll_number', 'grade', 'class', 'date_of_birth', 'gender', 'emergency_contact', 'created_at'];
const userAttrs = ['id', 'name', 'email', 'phone', 'address'];

// @desc Get all students
// @route GET /api/students
// @access Private (admin, teacher)
router.get('/', protect, authorize('admin', 'teacher'), async (_req, res) => {
  try {
    const students = await Student.findAll({
      attributes: studentAttributes,
      include: [
        { model: User, as: 'user', attributes: userAttrs },
        { model: User, as: 'parent', attributes: userAttrs }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: students.length,
      data: students.map(s => ({
        id: s.id,
        roll_number: s.roll_number,
        grade: s.grade,
        class: s.class,
        date_of_birth: s.date_of_birth,
        gender: s.gender,
        emergency_contact: s.emergency_contact,
        created_at: s.created_at,
        name: s.user?.name,
        email: s.user?.email,
        phone: s.user?.phone,
        address: s.user?.address,
        parent_name: s.parent?.name || null,
        parent_email: s.parent?.email || null,
        parent_phone: s.parent?.phone || null
      }))
    });
  } catch (e) {
    console.error('Get students error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc Get single student
// @route GET /api/students/:id
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id, {
      attributes: studentAttributes.concat(['user_id', 'parent_id']),
      include: [
        { model: User, as: 'user', attributes: userAttrs },
        { model: User, as: 'parent', attributes: userAttrs }
      ]
    });
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    if (req.user.role === 'student' && student.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this student data' });
    }
    if (req.user.role === 'parent' && student.parent_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this student data' });
    }
    if (!['admin', 'teacher', 'student', 'parent'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Not authorized to access student data' });
    }

    res.json({
      success: true,
      data: {
        id: student.id,
        roll_number: student.roll_number,
        grade: student.grade,
        class: student.class,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        emergency_contact: student.emergency_contact,
        created_at: student.created_at,
        name: student.user?.name,
        email: student.user?.email,
        phone: student.user?.phone,
        address: student.user?.address,
        parent_name: student.parent?.name || null,
        parent_email: student.parent?.email || null,
        parent_phone: student.parent?.phone || null
      }
    });
  } catch (e) {
    console.error('Get student error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc Create student
// @route POST /api/students
// @access Private (admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('user_id').isInt(),
    body('roll_number').notEmpty(),
    body('grade').notEmpty(),
    body('class').notEmpty(),
    body('date_of_birth').isISO8601(),
    body('gender').isIn(['male', 'female', 'other'])
  ],
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const {
        user_id,
        roll_number,
        grade,
        class: className,
        parent_id,
        date_of_birth,
        gender,
        emergency_contact
      } = req.body;

      const user = await User.findByPk(user_id, { attributes: ['id', 'role'] });
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      if (user.role !== 'student') {
        return res.status(400).json({ success: false, error: 'User must have student role' });
      }

      const dupRoll = await Student.findOne({ where: { roll_number } });
      if (dupRoll) return res.status(400).json({ success: false, error: 'Roll number already exists' });

      const existing = await Student.findOne({ where: { user_id } });
      if (existing) return res.status(400).json({ success: false, error: 'Student already exists for this user' });

      const now = new Date();
      const created = await Student.create({
        user_id,
        roll_number,
        grade,
        class: className,
        parent_id: parent_id || null,
        date_of_birth,
        gender,
        emergency_contact: emergency_contact || null,
        created_at: now,
        updated_at: now
      });

      const full = await Student.findByPk(created.id, {
        attributes: studentAttributes,
        include: [{ model: User, as: 'user', attributes: userAttrs }]
      });

      res.status(201).json({
        success: true,
        data: {
          id: full.id,
          roll_number: full.roll_number,
          grade: full.grade,
          class: full.class,
          date_of_birth: full.date_of_birth,
          gender: full.gender,
          emergency_contact: full.emergency_contact,
          created_at: full.created_at,
          name: full.user?.name,
          email: full.user?.email,
          phone: full.user?.phone,
          address: full.user?.address
        }
      });
    } catch (e) {
      console.error('Create student error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// @desc Update student
// @route PUT /api/students/:id
// @access Private (admin, teacher)
router.put(
  '/:id',
  protect,
  authorize('admin', 'teacher'),
  [
    body('grade').optional().notEmpty(),
    body('class').optional().notEmpty(),
    body('date_of_birth').optional().isISO8601(),
    body('gender').optional().isIn(['male', 'female', 'other'])
  ],
  async (req, res) => {
    if (validate(req, res)) return;
    try {
      const { id } = req.params;
      const student = await Student.findByPk(id);
      if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

      const { grade, class: className, parent_id, date_of_birth, gender, emergency_contact } = req.body;

      const updateData = {};
      if (grade !== undefined) updateData.grade = grade;
      if (className !== undefined) updateData.class = className;
      if (parent_id !== undefined) updateData.parent_id = parent_id;
      if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
      if (gender !== undefined) updateData.gender = gender;
      if (emergency_contact !== undefined) updateData.emergency_contact = emergency_contact;
      if (!Object.keys(updateData).length) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }
      updateData.updated_at = new Date();

      await student.update(updateData);

      const full = await Student.findByPk(id, {
        attributes: studentAttributes,
        include: [{ model: User, as: 'user', attributes: userAttrs }]
      });

      res.json({
        success: true,
        data: {
          id: full.id,
          roll_number: full.roll_number,
          grade: full.grade,
          class: full.class,
          date_of_birth: full.date_of_birth,
          gender: full.gender,
          emergency_contact: full.emergency_contact,
          created_at: full.created_at,
          name: full.user?.name,
          email: full.user?.email,
          phone: full.user?.phone,
          address: full.user?.address
        }
      });
    } catch (e) {
      console.error('Update student error:', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// @desc Delete student
// @route DELETE /api/students/:id
// @access Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
    await student.destroy();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (e) {
    console.error('Delete student error:', e);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

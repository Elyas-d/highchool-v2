const express = require('express');
const { body, validationResult } = require('express-validator');
// const { pool } = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const db = require('../models');
const { Resource, Class, Subject } = db;

const router = express.Router();

// @desc    Get resources
// @route   GET /api/resources
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { class_id, subject_id, uploaded_by } = req.query;
    const where = {};
    if (class_id) where.class_id = class_id;
    if (subject_id) where.subject_id = subject_id;
    if (uploaded_by) where.uploaded_by = uploaded_by;

    const resources = await Resource.findAll({
      where,
      attributes: [
        'id',
        'title',
        'description',
        'file_path',
        'file_type',
        'file_size',
        'class_id',
        'subject_id',
        'created_at'
      ],
      include: [
        { model: db.Class, as: 'class', attributes: ['name', 'grade'] },
        { model: db.Subject, as: 'subject', attributes: ['name', 'code'] },
        { model: db.User, as: 'uploader', attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: resources.length,
      data: resources.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        file_path: r.file_path,
        file_type: r.file_type,
        file_size: r.file_size,
        class_id: r.class_id,
        subject_id: r.subject_id,
        created_at: r.created_at,
        class_name: r.class?.name || null,
        grade: r.class?.grade || null,
        subject_name: r.subject?.name || null,
        subject_code: r.subject?.code || null,
        uploaded_by_name: r.uploader?.name || null
      }))
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const r = await Resource.findByPk(id, {
      attributes: [
        'id',
        'title',
        'description',
        'file_path',
        'file_type',
        'file_size',
        'class_id',
        'subject_id',
        'created_at'
      ],
      include: [
        { model: db.Class, as: 'class', attributes: ['name', 'grade'] },
        { model: db.Subject, as: 'subject', attributes: ['name', 'code'] },
        { model: db.User, as: 'uploader', attributes: ['name'] }
      ]
    });
    if (!r) return res.status(404).json({ success: false, error: 'Resource not found' });

    res.json({
      success: true,
      data: {
        id: r.id,
        title: r.title,
        description: r.description,
        file_path: r.file_path,
        file_type: r.file_type,
        file_size: r.file_size,
        class_id: r.class_id,
        subject_id: r.subject_id,
        created_at: r.created_at,
        class_name: r.class?.name || null,
        grade: r.class?.grade || null,
        subject_name: r.subject?.name || null,
        subject_code: r.subject?.code || null,
        uploaded_by_name: r.uploader?.name || null
      }
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// validators shared
const createValidators = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('file_path').notEmpty().withMessage('File path is required'),
  body('file_type').notEmpty().withMessage('File type is required'),
  body('file_size').isInt({ min: 1 }).withMessage('File size must be a positive number')
];

// @desc    Create resource
// @route   POST /api/resources
// @access  Private (Admin, Teacher)
router.post('/', protect, authorize('admin', 'teacher'), createValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const {
      title,
      description,
      file_path,
      file_type,
      file_size,
      class_id,
      subject_id
    } = req.body;

    if (class_id) {
      const cls = await Class.findByPk(class_id, { attributes: ['id'] });
      if (!cls) return res.status(404).json({ success: false, error: 'Class not found' });
    }
    if (subject_id) {
      const sub = await Subject.findByPk(subject_id, { attributes: ['id'] });
      if (!sub) return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const now = new Date();
    const created = await Resource.create({
      title,
      description,
      file_path,
      file_type,
      file_size,
      class_id: class_id || null,
      subject_id: subject_id || null,
      uploaded_by: req.user.id,
      created_at: now,
      updated_at: now
    });

    const r = await Resource.findByPk(created.id, {
      attributes: [
        'id',
        'title',
        'description',
        'file_path',
        'file_type',
        'file_size',
        'class_id',
        'subject_id',
        'created_at'
      ],
      include: [
        { model: db.Class, as: 'class', attributes: ['name', 'grade'] },
        { model: db.Subject, as: 'subject', attributes: ['name', 'code'] },
        { model: db.User, as: 'uploader', attributes: ['name'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: {
        id: r.id,
        title: r.title,
        description: r.description,
        file_path: r.file_path,
        file_type: r.file_type,
        file_size: r.file_size,
        class_id: r.class_id,
        subject_id: r.subject_id,
        created_at: r.created_at,
        class_name: r.class?.name || null,
        grade: r.class?.grade || null,
        subject_name: r.subject?.name || null,
        subject_code: r.subject?.code || null,
        uploaded_by_name: r.uploader?.name || null
      }
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Admin, Teacher)
router.put(
  '/:id',
  protect,
  authorize('admin', 'teacher'),
  [
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { id } = req.params;
      const { title, description, class_id, subject_id } = req.body;

      const resource = await Resource.findByPk(id);
      if (!resource) return res.status(404).json({ success: false, error: 'Resource not found' });

      if (class_id !== undefined) {
        if (class_id) {
          const cls = await Class.findByPk(class_id, { attributes: ['id'] });
            if (!cls) return res.status(404).json({ success: false, error: 'Class not found' });
        }
        resource.class_id = class_id || null;
      }

      if (subject_id !== undefined) {
        if (subject_id) {
          const sub = await Subject.findByPk(subject_id, { attributes: ['id'] });
          if (!sub) return res.status(404).json({ success: false, error: 'Subject not found' });
        }
        resource.subject_id = subject_id || null;
      }

      if (title !== undefined) resource.title = title;
      if (description !== undefined) resource.description = description;
      resource.updated_at = new Date();

      await resource.save();

      const r = await Resource.findByPk(resource.id, {
        attributes: [
          'id',
          'title',
          'description',
          'file_path',
          'file_type',
          'file_size',
          'class_id',
          'subject_id',
          'created_at'
        ],
        include: [
          { model: db.Class, as: 'class', attributes: ['name', 'grade'] },
          { model: db.Subject, as: 'subject', attributes: ['name', 'code'] },
          { model: db.User, as: 'uploader', attributes: ['name'] }
        ]
      });

      res.json({
        success: true,
        data: {
          id: r.id,
          title: r.title,
          description: r.description,
          file_path: r.file_path,
          file_type: r.file_type,
          file_size: r.file_size,
          class_id: r.class_id,
          subject_id: r.subject_id,
          created_at: r.created_at,
          class_name: r.class?.name || null,
          grade: r.class?.grade || null,
          subject_name: r.subject?.name || null,
          subject_code: r.subject?.code || null,
          uploaded_by_name: r.uploader?.name || null
        }
      });
    } catch (error) {
      console.error('Update resource error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin, Teacher)
router.delete('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByPk(id);
    if (!resource) return res.status(404).json({ success: false, error: 'Resource not found' });

    await resource.destroy();

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;

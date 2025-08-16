const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { Registration, RegistrationDocument } = db;

const router = express.Router();

// GET /api/registrations (admin)
router.get(
  '/',
  protect,
  authorize('admin'),
  [
    query('status').optional().isIn(['submitted','pending_review','approved','rejected']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { status } = req.query;
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

      const { rows, count } = await Registration.findAndCountAll({
        where,
        attributes: [
          'id','student_type','first_name','last_name','email','phone',
          'student_id','current_class','next_class','status','submitted_at','updated_at'
        ],
        order: [['submitted_at','DESC']],
        limit,
        offset
      });

      res.json({
        success: true,
        data: {
          items: rows.map(r => ({
            id: r.id,
            studentType: r.student_type,
            firstName: r.first_name,
            lastName: r.last_name,
            email: r.email,
            phone: r.phone,
            studentId: r.student_id,
            currentClass: r.current_class,
            nextClass: r.next_class,
            status: r.status,
            submittedAt: r.submitted_at,
            updatedAt: r.updated_at
          })),
          page,
          limit,
          total: count
        }
      });
    } catch (error) {
      console.error('List registrations error:', error);
      res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
  }
);

// POST /api/registrations (public)
router.post(
  '/',
  [
    body('studentType').isIn(['new','existing']),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('studentId').optional({ nullable: true }).isString(),
    body('currentClass').optional({ nullable: true }).isString(),
    body('nextClass').optional({ nullable: true }).isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const {
        studentType, firstName, lastName, email, phone,
        studentId, currentClass, nextClass
      } = req.body;

      try {
        const created = await Registration.create({
          student_type: studentType,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          student_id: studentId || null,
          current_class: currentClass || null,
          next_class: nextClass || null,
          status: 'submitted',
          submitted_at: new Date(),
          updated_at: new Date()
        });
        return res.status(201).json({ success: true, data: { id: created.id } });
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          return res.status(409).json({
            success: false,
            error: 'DUPLICATE_SUBMISSION',
            message: 'A submission already exists for this email address under review.'
          });
        }
        throw err;
      }
    } catch (error) {
      console.error('Create registration error:', error);
      res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
  }
);

// File uploads
const uploadDir = path.join(__dirname, '../uploads/registration');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST documents
router.post(
  '/:id/documents',
  protect,
  authorize('admin'),
  upload.array('files', 5),
  async (req, res) => {
    try {
      const registrationId = parseInt(req.params.id, 10);
      if (!registrationId || !req.files?.length) {
        return res.status(400).json({ success: false, error: 'No files uploaded' });
      }
      const registration = await Registration.findByPk(registrationId, { attributes: ['id'] });
      if (!registration) {
        return res.status(404).json({ success: false, error: 'Registration not found' });
      }
      const docType = req.body?.docType || null;
      const toCreate = req.files.map(f => ({
        registration_id: registrationId,
        doc_type: docType,
        original_name: f.originalname,
        mime_type: f.mimetype,
        file_path: path.join('uploads/registration', f.filename),
        uploaded_at: new Date()
      }));
      await RegistrationDocument.bulkCreate(toCreate);
      res.json({ success: true });
    } catch (error) {
      console.error('Upload registration documents error:', error);
      res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
  }
);

// GET documents
router.get(
  '/:id/documents',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const registrationId = parseInt(req.params.id, 10);
      const docs = await RegistrationDocument.findAll({
        where: { registration_id: registrationId },
        order: [['uploaded_at','DESC']],
        attributes: [
          'id','registration_id','doc_type','original_name','mime_type','file_path','uploaded_at'
        ]
      });
      res.json({
        success: true,
        data: docs.map(d => ({
          id: d.id,
          registrationId: d.registration_id,
          docType: d.doc_type,
          originalName: d.original_name,
          mimeType: d.mime_type,
          filePath: d.file_path,
          uploadedAt: d.uploaded_at
        }))
      });
    } catch (error) {
      console.error('List registration documents error:', error);
      res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
  }
);

// PATCH status
router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  [body('status').isIn(['submitted','pending_review','approved','rejected'])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const registrationId = parseInt(req.params.id, 10);
      const { status } = req.body;
      const reg = await Registration.findByPk(registrationId);
      if (!reg) return res.status(404).json({ success: false, error: 'Registration not found' });

      await reg.update({ status });
      res.json({ success: true });
    } catch (error) {
      console.error('Update registration status error:', error);
      res.status(500).json({ success: false, error: error.message || 'Server error' });
    }
  }
);

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const db = require('../models');
const { RegistrationSetting } = db;

const router = express.Router();

// @desc Get registration settings
// @route GET /api/settings/registration
// @access Public
router.get('/registration', async (_req, res) => {
  try {
    const setting = await RegistrationSetting.findByPk(1, {
      attributes: ['is_open', 'start_date', 'end_date', 'updated_at']
    });

    const row = setting || { is_open: false, start_date: null, end_date: null, updated_at: null };

    res.json({
      success: true,
      data: {
        isOpen: !!row.is_open,
        startDate: row.start_date,
        endDate: row.end_date,
        updatedAt: row.updated_at
      }
    });
  } catch (error) {
    console.error('Get registration settings error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc Update registration settings
// @route PUT /api/settings/registration
// @access Private (admin)
router.put(
  '/registration',
  protect,
  authorize('admin'),
  [
    body('isOpen').isBoolean().withMessage('isOpen must be boolean'),
    body('startDate').optional({ nullable: true }).isISO8601().withMessage('startDate must be a valid date'),
    body('endDate').optional({ nullable: true }).isISO8601().withMessage('endDate must be a valid date')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { isOpen, startDate, endDate } = req.body;

      let setting = await RegistrationSetting.findByPk(1);
      if (!setting) {
        setting = await RegistrationSetting.create({
          id: 1,
          is_open: !!isOpen,
          start_date: startDate || null,
          end_date: endDate || null
        });
      } else {
        await setting.update({
          is_open: !!isOpen,
          start_date: startDate || null,
          end_date: endDate || null
        });
      }

      res.json({
        success: true,
        data: {
          isOpen: !!setting.is_open,
          startDate: setting.start_date,
          endDate: setting.end_date
        }
      });
    } catch (error) {
      console.error('Update registration settings error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

module.exports = router;

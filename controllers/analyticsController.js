const analyticsService = require('../services/analyticsService');

async function getSummary(req, res) {
  try {
    const data = await analyticsService.getSummaryMetrics();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
}

async function getAttendance(req, res) {
  try {
    const data = await analyticsService.getAttendanceAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Analytics attendance error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
}

module.exports = {
  getSummary,
  getAttendance
};

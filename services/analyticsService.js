const { Op } = require('sequelize');
const db = require('../models');
const { sequelize } = db;

// Helper to safely get table existence (optional enhancement)
async function tableExists(table) {
  try {
    await sequelize.query(`SELECT 1 FROM ${table} LIMIT 1`);
    return true;
  } catch {
    return false;
  }
}

async function getSummaryMetrics() {
  const User = db.User;
  const Attendance = db.Attendance;

  const [totalStudents, activeTeachers] = await Promise.all([
    User.count({ where: { role: 'student' } }),
    User.count({ where: { role: 'teacher' } })
  ]);

  // Attendance rate last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [attendanceTotal, attendancePresent] = await Promise.all([
    Attendance.count({ where: { date: { [Op.gte]: thirtyDaysAgo } } }),
    Attendance.count({ where: { date: { [Op.gte]: thirtyDaysAgo }, status: 'present' } })
  ]);

  const attendanceRate = attendanceTotal > 0
    ? Math.round((attendancePresent / attendanceTotal) * 1000) / 10
    : null;

  // Monthly revenue (optional Payments table)
  let monthlyRevenue = 0;
  if (db.Payment && await tableExists('Payments')) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    monthlyRevenue = await db.Payment.sum('amount', {
      where: {
        createdAt: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
        status: 'completed'
      }
    }) || 0;
  }

  return {
    totalStudents,
    activeTeachers,
    monthlyRevenue,
    attendanceRate
  };
}

async function getAttendanceAnalytics() {
  const { Attendance, Class, User, Student } = db;

  const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10); // inclusive last 30 days

  // Today stats
  const [todayPresent, todayAbsent, todayLate, todayTotal] = await Promise.all([
    Attendance.count({ where: { date: todayDate, status: 'present' } }),
    Attendance.count({ where: { date: todayDate, status: 'absent' } }),
    Attendance.count({ where: { date: todayDate, status: 'late' } }),
    Attendance.count({ where: { date: todayDate } })
  ]);

  const today = {
    total: todayTotal,
    present: todayPresent,
    absent: todayAbsent,
    late: todayLate,
    percentage: todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0
  };

  // Yesterday stats
  const [yPresent, yAbsent, yLate, yTotal] = await Promise.all([
    Attendance.count({ where: { date: yesterdayDate, status: 'present' } }),
    Attendance.count({ where: { date: yesterdayDate, status: 'absent' } }),
    Attendance.count({ where: { date: yesterdayDate, status: 'late' } }),
    Attendance.count({ where: { date: yesterdayDate } })
  ]);

  const yesterday = {
    total: yTotal,
    present: yPresent,
    absent: yAbsent,
    late: yLate
  };

  // Class attendance (today) – LEFT JOIN equivalent
  const classes = await Class.findAll({
    attributes: ['id', 'name', 'grade'],
    include: [
      {
        model: Attendance,
        as: 'attendance',
        where: { date: todayDate },
        required: false // left join
      }
    ]
  });

  const classAttendance = classes.map(c => {
    const records = c.attendance || [];
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const total = records.length;
    return {
      class: `${c.grade} ${c.name}`,
      present,
      absent,
      late,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }).sort((a, b) => a.class.localeCompare(b.class));

  // Student attendance last 30 days
  // We rely on User.role='student' and the hasOne Student alias 'studentProfile'
  const studentUsers = await User.findAll({
    where: { role: 'student' },
    attributes: ['id', 'name'],
    include: [
      {
        model: Student,
        as: 'studentProfile',
        attributes: ['id', 'grade', 'class'],
        include: [
          {
            model: Attendance,
            as: 'attendance',
            where: { date: { [Op.gte]: thirtyDaysAgo } },
            required: false
          }
        ]
      }
    ]
  });

  const studentAttendance = studentUsers.map(u => {
    const sp = u.studentProfile;
    if (!sp) {
      return {
        id: u.id,
        student: u.name,
        class: '',
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        percentage: 0,
        lastAbsent: null
      };
    }
    const records = sp.attendance || [];
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const total = records.length;
    const lastAbsent = records
      .filter(r => r.status === 'absent')
      .map(r => r.date)
      .sort()
      .slice(-1)[0] || null;
    return {
      id: Math.random().toString(36).slice(2, 11),
      student: u.name,
      class: `${sp.grade || ''} ${sp.class || ''}`.trim(),
      present,
      absent,
      late,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      lastAbsent
    };
  }).sort((a, b) => a.class.localeCompare(b.class) || a.student.localeCompare(b.student));

  // Alerts: attendance rate < 85 or no records (treat as null -> include)
  const alerts = studentAttendance
    .filter(s => (s.total === 0) || s.percentage < 85)
    .sort((a, b) => (a.percentage - b.percentage) || (b.absent - a.absent))
    .slice(0, 10)
    .map(s => ({
      id: Math.random().toString(36).slice(2, 11),
      student: s.student,
      class: s.class,
      attendanceRate: s.percentage,
      consecutiveAbsences: s.absent, // placeholder (needs streak logic if required)
      lastAbsent: s.lastAbsent,
      totalAbsences: s.absent,
      totalLates: s.late,
      totalPresent: s.present
    }));

  return { today, yesterday, classAttendance, studentAttendance, alerts };
}

module.exports = {
  getSummaryMetrics,
  getAttendanceAnalytics
};

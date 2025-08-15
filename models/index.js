'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Explicit associations
const {
  User, Student, Teacher, Material, ChatSupport, TeacherClass, Class, GradeLevel, Subject, Submission, Attendance, Payment, Announcement, Grade
} = db;

// User Associations
User.hasOne(Student, { foreignKey: 'id' });
// REMOVED: User.hasOne(Staff, { foreignKey: 'id' });
User.hasMany(Student, { foreignKey: 'parent_id', as: 'children' });
// REMOVED incorrect: User.hasMany(Material, { foreignKey: 'teacher_id' });
// REMOVED incorrect: User.belongsToMany(Class, { through: TeacherClass, foreignKey: 'teacher_id' });

// Student Associations
Student.belongsTo(User, { foreignKey: 'id' });
Student.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });
Student.belongsTo(GradeLevel);
Student.belongsTo(Class);
Student.hasMany(Submission);
Student.hasMany(Attendance);
Student.hasMany(Grade);
Student.hasMany(Payment);

// REMOVED Staff Associations; replaced with Teacher associations if needed:
Teacher.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Teacher.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements' });
Teacher.hasMany(ChatSupport, { foreignKey: 'responser_id', as: 'handledChats' });
Teacher.hasMany(Material, { foreignKey: 'teacher_id', as: 'materials' }); // added
Teacher.belongsToMany(Class, { through: TeacherClass, foreignKey: 'teacher_id', as: 'classes' }); // added

// GradeLevel and Subject
GradeLevel.hasMany(Subject);
Subject.belongsTo(GradeLevel);
Subject.hasMany(Material);

// Material
Material.belongsTo(Subject);
Material.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
Material.hasMany(Submission);

// Submission
Submission.belongsTo(Student);
Submission.belongsTo(Material);

// Class
Class.hasMany(Student);
// REMOVED incorrect: Class.belongsToMany(User, { through: TeacherClass, foreignKey: 'class_id' });
Class.belongsToMany(Teacher, { through: TeacherClass, foreignKey: 'class_id', as: 'teachers' }); // added

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

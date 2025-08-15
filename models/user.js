import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      // 1:1
      User.hasOne(models.Student, { foreignKey: 'user_id', as: 'studentProfile', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      User.hasOne(models.Teacher, { foreignKey: 'user_id', as: 'teacherProfile', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      // 1:M authored / ownership relations
      User.hasMany(models.Assignment, { foreignKey: 'created_by', as: 'assignments' });
      User.hasMany(models.Announcement, { foreignKey: 'created_by', as: 'announcements' });
      User.hasMany(models.Grade, { foreignKey: 'graded_by', as: 'gradedItems' });
      User.hasMany(models.Attendance, { foreignKey: 'marked_by', as: 'markedAttendance' });
      User.hasMany(models.Resource, { foreignKey: 'uploaded_by', as: 'resources' });
      User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
      // Parent -> children students
      User.hasMany(models.Student, { foreignKey: 'parent_id', as: 'children', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    }
  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'parent', 'student'),
      allowNull: false,
      defaultValue: 'student',
    },
    profile_image: DataTypes.STRING(500),
    phone: DataTypes.STRING(20),
    address: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  });
  return User;
};
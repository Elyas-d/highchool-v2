import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Student.belongsTo(models.User, { foreignKey: 'parent_id', as: 'parent', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
      Student.hasMany(models.Submission, { foreignKey: 'student_id', as: 'submissions' });
      Student.hasMany(models.Grade, { foreignKey: 'student_id', as: 'grades' });
      Student.hasMany(models.Attendance, { foreignKey: 'student_id', as: 'attendance' });
      Student.belongsToMany(models.Class, {
        through: models.Enrollment,
        foreignKey: 'student_id',
        otherKey: 'class_id',
        as: 'classes'
      });
    }
  }
  Student.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roll_number: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date_of_birth: DataTypes.DATEONLY,
    gender: DataTypes.ENUM('male', 'female', 'other'),
    emergency_contact: DataTypes.STRING(20),
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: false,
  });
  return Student;
};
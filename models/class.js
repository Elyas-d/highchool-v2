import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Class extends Model {
    static associate(models) {
      Class.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
      Class.hasMany(models.Assignment, { foreignKey: 'class_id', as: 'assignments' });
      Class.hasMany(models.Resource, { foreignKey: 'class_id', as: 'resources' });
      Class.hasMany(models.Grade, { foreignKey: 'class_id', as: 'grades' });
      Class.hasMany(models.Attendance, { foreignKey: 'class_id', as: 'attendance' });
      Class.hasMany(models.Announcement, { foreignKey: 'class_id', as: 'announcements' });
      // NEW reciprocal many-to-many (student <-> class) via enrollments
      Class.belongsToMany(models.Student, {
        through: models.Enrollment,
        foreignKey: 'class_id',
        otherKey: 'student_id',
        as: 'students'
      });
    }
  }
  Class.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    capacity: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Class',
    tableName: 'classes',
    timestamps: false,
  });
  return Class;
};
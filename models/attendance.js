import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Attendance.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Attendance.belongsTo(models.User, { foreignKey: 'marked_by', as: 'marker', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    }
  }
  Attendance.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late'),
      allowNull: false,
    },
    notes: DataTypes.TEXT,
    marked_by: { type: DataTypes.INTEGER, allowNull: false },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Attendance',
    tableName: 'attendance',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['student_id', 'class_id', 'date'], name: 'unique_attendance' }
    ]
  });
  return Attendance;
};
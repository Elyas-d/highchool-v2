import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Enrollment extends Model {
    static associate(models) {
      // Added explicit sides (optional but useful)
      Enrollment.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Enrollment.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Enrollment.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    enrolled_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'dropped'),
      allowNull: false,
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Enrollment',
    tableName: 'enrollments',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['student_id', 'class_id'], name: 'uniq_student_class' }
    ]
  });
  return Enrollment;
};

import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Submission extends Model {
    static associate(models) {
      Submission.belongsTo(models.Assignment, { foreignKey: 'assignment_id', as: 'assignment', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Submission.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Submission.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assignment_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    file_path: { type: DataTypes.STRING(500) },
    notes: DataTypes.TEXT,
    submitted_at: DataTypes.DATE,
    graded_at: DataTypes.DATE,
    score: DataTypes.DECIMAL(5,2),
    feedback: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Submission',
    tableName: 'submissions',
    timestamps: false,
  });
  return Submission;
};
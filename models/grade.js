import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Grade extends Model {
    static associate(models) {
      Grade.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Grade.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Grade.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Grade.belongsTo(models.User, { foreignKey: 'graded_by', as: 'grader', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    }
    // percentage is virtual; computed by getter below
    get percentage() {
      if (this.score == null || this.max_score == null || this.max_score === 0) return null;
      return (this.score / this.max_score * 100).toFixed(2);
    }
  }
  Grade.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    assessment_type: {
      type: DataTypes.ENUM('exam', 'quiz', 'homework', 'project'),
      allowNull: false,
    },
    assessment_name: { type: DataTypes.STRING(255), allowNull: false },
    score: { type: DataTypes.DECIMAL(5,2), allowNull: false },
    max_score: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 100 },
    graded_by: { type: DataTypes.INTEGER, allowNull: false },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Grade',
    tableName: 'grades',
    timestamps: false,
  });
  return Grade;
};
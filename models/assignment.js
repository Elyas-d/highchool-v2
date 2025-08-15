import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Assignment extends Model {
    static associate(models) {
      Assignment.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Assignment.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Assignment.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
      Assignment.hasMany(models.Submission, { foreignKey: 'assignment_id', as: 'submissions' });
    }
  }
  Assignment.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    due_date: { type: DataTypes.DATE, allowNull: false },
    max_score: { type: DataTypes.DECIMAL(5,2), allowNull: true, defaultValue: 100 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Assignment',
    tableName: 'assignments',
    timestamps: false,
  });
  return Assignment;
};

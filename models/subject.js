import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Subject extends Model {
    static associate(models) {
      Subject.belongsTo(models.GradeLevel, { foreignKey: 'grade_level_id', as: 'gradeLevel' });
    }
  }
  Subject.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    grade_level_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'GradeLevels', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  }, {
    sequelize,
    modelName: 'Subject',
    timestamps: true,
    tableName: 'Subjects',
  });
  return Subject;
}; 
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class GradeLevel extends Model {
    static associate(models) {
      GradeLevel.hasMany(models.Subject, { foreignKey: 'grade_level_id', as: 'subjects' });
      GradeLevel.hasMany(models.Student, { foreignKey: 'grade_level_id', as: 'students' });
    }
  }
  GradeLevel.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'GradeLevel',
    timestamps: true,
    tableName: 'GradeLevels',
  });
  return GradeLevel;
}; 
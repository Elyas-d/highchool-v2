import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Submission extends Model {
    static associate(models) {
      Submission.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
      Submission.belongsTo(models.Material, { foreignKey: 'material_id', as: 'material' });
    }
  }
  Submission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Students', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    material_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Materials', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    file_url: DataTypes.STRING,
    status: DataTypes.STRING,
    score: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'Submission',
    timestamps: true,
    tableName: 'Submissions',
  });
  return Submission;
}; 
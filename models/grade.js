import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Grade extends Model {
    static associate(models) {
      Grade.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    }
  }
  Grade.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Students', key: 'id' },
    },
    score: DataTypes.FLOAT,
    term: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Grade',
    timestamps: true,
    tableName: 'Grades',
  });
  return Grade;
}; 
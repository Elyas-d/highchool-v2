import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsTo(models.User, { foreignKey: 'id', as: 'user' });
      Student.belongsTo(models.User, { foreignKey: 'parent_id', as: 'parent' });
    }
  }
  Student.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: { model: 'Users', key: 'id' },
    },
    grade_level_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
  }, {
    sequelize,
    modelName: 'Student',
    timestamps: true,
    tableName: 'Students',
  });
  return Student;
}; 
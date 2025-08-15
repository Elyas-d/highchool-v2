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
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    grade_level_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'GradeLevels', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Classes', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  }, {
    sequelize,
    modelName: 'Student',
    timestamps: true,
    tableName: 'Students',
  });
  return Student;
}; 
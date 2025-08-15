import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class TeacherClass extends Model {
    static associate(models) {
      TeacherClass.belongsTo(models.User, { foreignKey: 'teacher_id', as: 'teacher' });
      TeacherClass.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class' });
    }
  }
  TeacherClass.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
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
  }, {
    sequelize,
    modelName: 'TeacherClass',
    timestamps: true,
    tableName: 'TeacherClasses',
  });
  return TeacherClass;
}; 
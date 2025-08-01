import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Class extends Model {
    static associate(models) {
      Class.hasMany(models.Student, { foreignKey: 'class_id', as: 'students' });
    }
  }
  Class.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    block_number: DataTypes.STRING,
    room_number: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Class',
    timestamps: true,
    tableName: 'Classes',
  });
  return Class;
}; 
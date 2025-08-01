import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Staff extends Model {
    static associate(models) {
      Staff.belongsTo(models.User, { foreignKey: 'id', as: 'user' });
    }
  }
  Staff.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: { model: 'Users', key: 'id' },
    },
    department: DataTypes.STRING,
    position: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Staff',
    timestamps: true,
    tableName: 'Staffs',
  });
  return Staff;
}; 
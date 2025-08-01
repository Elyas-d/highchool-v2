import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Student, { foreignKey: 'id', as: 'student' });
      User.hasOne(models.Staff, { foreignKey: 'id', as: 'staff' });
      User.hasMany(models.Student, { foreignKey: 'parent_id', as: 'children' });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'parent', 'staff'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    tableName: 'Users',
  });
  return User;
}; 
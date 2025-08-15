import { Model, DataTypes } from 'sequelize';

// NOTE: This file now defines the Teacher model (was Staff). You may rename the file to teacher.js.
export default (sequelize) => {
  class Teacher extends Model {
    static associate(models) {
      Teacher.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Teacher.hasMany(models.Class, { foreignKey: 'teacher_id', as: 'classes' });
    }
  }
  Teacher.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    subject: DataTypes.STRING(100),
    qualification: DataTypes.STRING(255),
    experience_years: DataTypes.INTEGER,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Teacher',
    tableName: 'teachers',
    timestamps: false,
  });
  return Teacher;
};
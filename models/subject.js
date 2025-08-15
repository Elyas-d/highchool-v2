import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Subject extends Model {
    static associate(models) {
      Subject.hasMany(models.Assignment, { foreignKey: 'subject_id', as: 'assignments' });
      Subject.hasMany(models.Grade, { foreignKey: 'subject_id', as: 'grades' });
      Subject.hasMany(models.Resource, { foreignKey: 'subject_id', as: 'resources', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Subject.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    description: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Subject',
    tableName: 'subjects',
    timestamps: false,
  });
  return Subject;
};
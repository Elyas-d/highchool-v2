import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Material extends Model {
    static associate(models) {
      Material.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject' });
      Material.belongsTo(models.User, { foreignKey: 'teacher_id', as: 'teacher' });
    }
  }
  Material.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING,
    file_url: DataTypes.STRING,
    subject_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Subjects', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  }, {
    sequelize,
    modelName: 'Material',
    timestamps: true,
    tableName: 'Materials',
  });
  return Material;
}; 
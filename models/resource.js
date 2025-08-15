import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Resource extends Model {
    static associate(models) {
      Resource.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class' });
      Resource.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject' });
      Resource.belongsTo(models.User, { foreignKey: 'uploaded_by', as: 'uploader' });
    }
  }

  Resource.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: DataTypes.TEXT,
      file_path: { type: DataTypes.STRING(500), allowNull: false },
      file_type: DataTypes.STRING(50),
      file_size: DataTypes.INTEGER,
      class_id: DataTypes.INTEGER,
      subject_id: DataTypes.INTEGER,
      uploaded_by: { type: DataTypes.INTEGER, allowNull: false },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'Resource',
      tableName: 'resources',
      timestamps: false
    }
  );

  return Resource;
};

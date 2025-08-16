module.exports = (sequelize, DataTypes) => {
  const RegistrationDocument = sequelize.define(
    'RegistrationDocument',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      registration_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      doc_type: { type: DataTypes.STRING(50), allowNull: true },
      original_name: { type: DataTypes.STRING(255), allowNull: false },
      mime_type: { type: DataTypes.STRING(100), allowNull: false },
      file_path: { type: DataTypes.STRING(500), allowNull: false },
      uploaded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    },
    {
      tableName: 'registration_documents',
      timestamps: false
    }
  );

  RegistrationDocument.associate = models => {
    RegistrationDocument.belongsTo(models.Registration, {
      foreignKey: 'registration_id',
      as: 'registration'
    });
  };

  return RegistrationDocument;
};

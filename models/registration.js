module.exports = (sequelize, DataTypes) => {
  const Registration = sequelize.define(
    'Registration',
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      student_type: { type: DataTypes.ENUM('new', 'existing'), allowNull: false },
      first_name: { type: DataTypes.STRING(100), allowNull: false },
      last_name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(150), allowNull: false },
      phone: { type: DataTypes.STRING(50), allowNull: false },
      student_id: { type: DataTypes.STRING(50), allowNull: true },
      current_class: { type: DataTypes.STRING(50), allowNull: true },
      next_class: { type: DataTypes.STRING(50), allowNull: true },
      status: {
        type: DataTypes.ENUM('submitted','pending_review','approved','rejected'),
        allowNull: false,
        defaultValue: 'submitted'
      },
      submitted_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    },
    {
      tableName: 'registrations',
      timestamps: false
    }
  );

  Registration.beforeUpdate(inst => { inst.updated_at = new Date(); });

  Registration.associate = models => {
    Registration.hasMany(models.RegistrationDocument, {
      foreignKey: 'registration_id',
      as: 'documents'
    });
  };

  return Registration;
};

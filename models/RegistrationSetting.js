module.exports = (sequelize, DataTypes) => {
  const RegistrationSetting = sequelize.define(
    'RegistrationSetting',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true
      },
      is_open: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'registration_settings',
      timestamps: false
    }
  );

  RegistrationSetting.beforeCreate(instance => {
    instance.updated_at = new Date();
  });
  RegistrationSetting.beforeUpdate(instance => {
    instance.updated_at = new Date();
  });

  return RegistrationSetting;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  const { Model } = require('sequelize');
  class TeacherClass extends Model {
    static associate(models) {
      TeacherClass.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
      TeacherClass.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class' });
    }
  }
  TeacherClass.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Teachers', key: 'id' }, // corrected table name
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      class_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Classes', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'TeacherClass',
      tableName: 'TeacherClasses',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['teacher_id', 'class_id'], // prevent duplicate assignments
        },
      ],
    }
  );
  return TeacherClass;
};
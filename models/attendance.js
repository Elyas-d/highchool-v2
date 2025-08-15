import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    }
  }
  Attendance.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Students', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    isAttend: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Attendance',
    timestamps: true,
    tableName: 'Attendances',
  });
  return Attendance;
}; 
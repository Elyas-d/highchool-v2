import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    }
  }
  Payment.init({
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
    amount: DataTypes.FLOAT,
    method: DataTypes.STRING,
    purpose: DataTypes.STRING,
    status: DataTypes.STRING,
    reference_number: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Payment',
    timestamps: true,
    tableName: 'Payments',
  });
  return Payment;
}; 
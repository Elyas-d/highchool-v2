import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ChatSupport extends Model {
    static associate(models) {
      ChatSupport.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
      ChatSupport.belongsTo(models.Staff, { foreignKey: 'responser_id', as: 'responser' });
    }
  }
  ChatSupport.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    responser_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Staffs', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    message: DataTypes.TEXT,
    response: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'ChatSupport',
    timestamps: true,
    tableName: 'ChatSupports',
  });
  return ChatSupport;
}; 
'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Notification.init({
    notificationId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.STRING
    },
    isRead: {
      type: DataTypes.NUMBER
    },
    title: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.STRING
    },
    redirectUrl: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Notification',
    paranoid: true,
    timestamps: true
  });
  return Notification;
};
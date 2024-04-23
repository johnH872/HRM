'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Setting.init({
    key: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    group: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    value: {
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
    modelName: 'Setting',
    paranoid: true,
    timestamps: true
  });
  return Setting;
};
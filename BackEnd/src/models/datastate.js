'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class DataState extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DataState.hasMany(models.LeaveRequest, {
        foreignKey: 'status'
      });

      DataState.hasMany(models.AttendanceReport, {
        foreignKey: 'statusId'
      });
    }
  }
  DataState.init({
    dataStateId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    dataStateName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING
    },
    colorCode: {
      type: DataTypes.STRING
    },
    order: {
      type: DataTypes.INTEGER
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
    modelName: 'DataState',
    paranoid: true,
    timestamps: true
  });
  return DataState;
};
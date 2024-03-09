'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class LeaveType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LeaveType.hasMany(models.LeaveEntitlement);
    }
  }
  LeaveType.init({
    leaveTypeId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    leaveTypeName: {
      type: DataTypes.STRING
    },
    defaultStartDay: {
      type: DataTypes.INTEGER
    },
    defaultStartMonth: {
      type: DataTypes.INTEGER
    },
    defaultEndDay: {
      type: DataTypes.INTEGER
    },
    defaultEndMonth: {
      type: DataTypes.INTEGER
    },
    defaultBudget: {
      type: DataTypes.INTEGER
    },
    isPaidSalary: {
      type: DataTypes.BOOLEAN
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
    modelName: 'LeaveType',
  });
  return LeaveType;
};
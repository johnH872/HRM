'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class LeaveRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LeaveRequest.belongsTo(models.DataState, {
        foreignKey: 'status'
      });
      LeaveRequest.belongsTo(models.LeaveEntitlement, { 
        foreignKey: 'leaveEntitlementId'
      });
      LeaveRequest.belongsTo(models.User, {
        foreignKey: 'userId'
      });
    }
  }
  LeaveRequest.init({
    leaveRequestId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.UUID
    },
    leaveEntitlementId: {
      type: DataTypes.INTEGER
    },
    leaveDateFrom: {
      type: DataTypes.DATE
    },
    leaveDateTo: {
      type: DataTypes.DATE
    },
    session: {
      type: DataTypes.STRING
    },
    numberOfHour: {
      type: DataTypes.DOUBLE
    },
    status: {
      type: DataTypes.INTEGER
    },
    note: {
      type: DataTypes.STRING
    },
    reason: {
      type: DataTypes.STRING
    },
    reasonRejected: {
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
    modelName: 'LeaveRequest',
    paranoid: true,
    timestamps: true
  });
  return LeaveRequest;
};
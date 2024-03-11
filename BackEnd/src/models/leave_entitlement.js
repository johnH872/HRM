'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class LeaveEntitlement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LeaveEntitlement.belongsTo(models.LeaveType, { as: 'leaveType' });
      LeaveEntitlement.belongsTo(models.User, { as: 'employee' } );
      LeaveEntitlement.hasMany(models.LeaveRequest);
    }
  }
  LeaveEntitlement.init({
    leaveEntitlementId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.UUID
    },
    leaveTypeId: {
      type: DataTypes.INTEGER
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    },
    availableLeave: {
      type: DataTypes.DOUBLE
    },
    usableLeave: {
      type: DataTypes.DOUBLE
    },
    usedLeave: {
      type: DataTypes.DOUBLE
    },
    effectedYear: {
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
    modelName: 'LeaveEntitlement',
    paranoid: true,
    timestamps: true
  });
  return LeaveEntitlement;
};
'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class AttendanceReport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      AttendanceReport.belongsTo(models.DataState, {
        foreignKey: 'statusId',
        as: 'status'
      });
    }
  }
  AttendanceReport.init({
    attendanceReportId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    email: {
      type: DataTypes.STRING
    },
    note: {
      type: DataTypes.STRING
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    type: {
      allowNull: false,
      type: DataTypes.STRING
    },
    statusId: {
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
    modelName: 'AttendanceReport',
    paranoid: true,
    timestamps: true
  });
  return AttendanceReport;
};
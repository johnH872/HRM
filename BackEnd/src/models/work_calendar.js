'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class WorkCalendar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WorkCalendar.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      WorkCalendar.hasMany(models.WorkCalendarDetail, {
        foreignKey: 'workCalendarId',
      });
    }
  }
  WorkCalendar.init({
    workCalendarId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      allowNull: false,
      type: DataTypes.UUID
    },
    workingDate: {
      allowNull: false,
      type: DataTypes.DATE
    },
    workingType: {
      type: DataTypes.INTEGER
    },
    workingHour: {
      type: DataTypes.DOUBLE
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
    modelName: 'WorkCalendar',
    paranoid: true,
    timestamps: true
  });
  return WorkCalendar;
};
'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class WorkCalendarDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WorkCalendarDetail.belongsTo(models.WorkCalendar, {
        foreignKey: 'workCalendarId',
      });
    }
  }
  WorkCalendarDetail.init({
    workCalendarDetailId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    workCalendarId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    from: {
      type: DataTypes.STRING
    },
    to: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    code_color: {
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
    modelName: 'WorkCalendarDetail',
  });
  return WorkCalendarDetail;
};
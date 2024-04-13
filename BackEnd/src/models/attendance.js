'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attendance.belongsTo(models.User, {
        foreignKey: 'userId',
      });
    }
  }
  Attendance.init({
    attendanceId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.UUID
    },
    punchinDate: {
      type: DataTypes.DATE
    },
    punchinTime: {
      type: DataTypes.DOUBLE
    },
    punchinNote: {
      type: DataTypes.STRING
    },
    punchinOffset: {
      type: DataTypes.INTEGER
    },
    punchoutDate: {
      type: DataTypes.DATE
    },
    punchoutTime: {
      type: DataTypes.DOUBLE
    },
    punchoutNote: {
      type: DataTypes.STRING
    },
    punchoutOffset: {
      type: DataTypes.INTEGER
    },
    punchInImageUrl: {
      type: DataTypes.STRING
    },
    punchOutImageUrl: {
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
    modelName: 'Attendance',
    paranoid: true,
    timestamps: true
  });
  return Attendance;
};
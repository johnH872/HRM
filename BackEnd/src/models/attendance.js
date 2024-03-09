'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attendance.belongsTo(models.User, { as: 'employee' } );
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
  });
  return Attendance;
};
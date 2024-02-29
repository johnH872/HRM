'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.belongsToMany(models.Permission, {through: models.Role_Permission});
      Role.belongsToMany(models.User, { through: 'User_Role', foreignKey:"roleId"});
    }
  }
  Role.init({
    roleId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID
    },
    roleName: {
      type: DataTypes.STRING
    },
    roleDescription: {
      type: DataTypes.STRING
    },
    displayName: {
      type: DataTypes.STRING
    },
    defaultScreen: {
      type: DataTypes.STRING
    },
    priority: {
      type: DataTypes.INTEGER
    },
    isShow: {
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
    modelName: 'Role',
    paranoid: true,
    timestamps: true
  });
  return Role;
};
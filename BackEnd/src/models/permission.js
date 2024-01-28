'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Permission.belongsToMany(models.Role, {through: 'RolePermission'})
    }
  }
  Permission.init({
    displayName: DataTypes.STRING,
    permission: DataTypes.STRING,
    screen: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Permission',
    timestamps: true,
    paranoid: true
  });
  return Permission;
};
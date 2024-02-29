'use strict';
import { Model } from 'sequelize';
import bcrypt from 'bcrypt';
export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsToMany(models.Role, { through: 'User_Role',foreignKey:"userId"});
    }
  }
  User.init({
    userId: {
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID
    },
    firstName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    middleName: {
      type: DataTypes.STRING
    },
    lastName: {
      allowNull: false,
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    birth: {
      type: DataTypes.DATEONLY
    },
    gender: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    nationality: {
      type: DataTypes.STRING
    },
    avatarUrl: {
      type: DataTypes.STRING
    },
    phoneNumber: {
      type: DataTypes.STRING
    },
    jobTitle: {
      type: DataTypes.STRING
    },
    dateStartContract: {
      type: DataTypes.DATE
    },
    ownerId: {
      type: DataTypes.UUID
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
    modelName: 'User',
    paranoid: true,
    timestamps: true
  });

  // User.beforeSave(async(user, options) => {
  //   if(user.password) {
  //     user.password = bcrypt.hash(user.password, 10);
  //   }
  // });

  User.prototype.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, function(error, isMatch) {
      if(error) {
        return cb(error);
      }
      cb(null, isMatch);
    })
  }
  return User;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Chat.init({
    cr_id: DataTypes.INTEGER,
    user_one: DataTypes.INTEGER,
    user_two: DataTypes.INTEGER,
    time: DataTypes.DATE,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};
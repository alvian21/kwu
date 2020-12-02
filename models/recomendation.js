'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recomendation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Recomendation.init({
    user_id: DataTypes.INTEGER,
    post_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    time: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Recomendation',
  });
  return Recomendation;
};
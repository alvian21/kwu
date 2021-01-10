'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Link extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Link.init({
    designer_id: DataTypes.INTEGER,
    link_skype: DataTypes.STRING,
    link_wa: DataTypes.STRING,
    link_email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Link',
  });
  return Link;
};
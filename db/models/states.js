'use strict';
module.exports = (sequelize, DataTypes) => {
  const states = sequelize.define('states', {
    name: DataTypes.STRING,
    short_name: DataTypes.STRING,
    active: DataTypes.STRING
  }, {});
  states.associate = function(models) {
    // associations can be defined here
  };
  return states;
};
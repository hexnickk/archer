'use strict';
module.exports = (sequelize, DataTypes) => {
  var attribute = sequelize.define('attribute', {
    data: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) { // eslint-disable-line no-unused-vars
        // associations can be defined here
      }
    }
  });
  return attribute;
};

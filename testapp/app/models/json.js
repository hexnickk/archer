'use strict';
module.exports = (sequelize, DataTypes) => {
  var json = sequelize.define('json', {
    data: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) { // eslint-disable-line no-unused-vars
        // associations can be defined here
      }
    }
  });
  return json;
};

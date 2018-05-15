'use strict';
module.exports = (sequelize, DataTypes) => {
  var inscript = sequelize.define('inscript', {
    data: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) { // eslint-disable-line no-unused-vars
        // associations can be defined here
      }
    }
  });
  return inscript;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  var post = sequelize.define('post', {
    data: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) { // eslint-disable-line no-unused-vars
        // associations can be defined here
      }
    }
  });
  return post;
};
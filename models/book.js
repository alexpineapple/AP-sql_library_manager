'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //define association here
    }
  };

  Book.init({
    title: {
      type: DataTypes.STRING,
      validate: { notEmpty: {msg: "Title is required"} }
    },
    author: {
      type: DataTypes.STRING,
      validate: { notEmpty: {msg: "Author is required"} }
    },
    genre: {
      type: DataTypes.STRING,
      validate: { isAlphanumeric: {msg: "Invalid genre - Please only use alphanumeric characters"} }
    },
    year: {
      type: DataTypes.INTEGER,
      validate: { isInt: {msg: "Year should be an integer"} }
    }
    }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};

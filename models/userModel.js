/* ******************************************
 * WEB222NGG
 * Assignment
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov, 2020
 ******************************************** */

// require mongoose and setup the Schema
const mongoose = require("mongoose");
const emailValidator = require("email-validator");


const Schema = mongoose.Schema;

// use bluebird promise library with mongoose
mongoose.Promise = require("bluebird");

// define the user schema (default as normal user)
const UserSchema = new Schema({
  "fName": {
    type: String,
    trim: true
  },
  "lName": {
    type: String,
    trim: true
  },
  "email": {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // case insensitive
    index: {
      unique: true
    },
    validate: {
      validator: emailValidator.validate,
      message: props => `${props.value} is not a valid email address!`,
    }
  },
  "username": {
    type: String,
    unique: true,
    required: true,
    trim: true,
    index: {
      unique: true
    },
    minlength: 3
  },
  "password": {
    type: String,
    required: true,
    trim: true,
    index: {
      unique: true
    },
    minlength: 8
  },
  "isAdmin": {
    type: Boolean,
    default: false
  }
});

// export userModel
module.exports = mongoose.model('Users', UserSchema);
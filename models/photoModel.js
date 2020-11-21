/* ******************************************
 * WEB222NGG
 * Assignment
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov, 2020
 ******************************************** */

// require mongoose and setup the Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// use bluebird promise library with mongoose
mongoose.Promise = require("bluebird");

// define the photo schema
const PhotoSchema = new Schema({
  "filename": {
    type: String,
    unique: true
  },   
  "caption": String,
  "room": String, // update later to room_id
  "createdOn": {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Photos", PhotoSchema);


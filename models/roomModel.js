/* ******************************************
 * WEB222NGG
 * Assignment
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov, 2020
 ******************************************** */

 // require mongoose and setup the Schema
 const { text } = require("express");
const mongoose = require("mongoose");
 const Schema = mongoose.Schema;
 
 // use bluebird promise library with mongoose
 mongoose.Promise = require("bluebird");
 
 // define the BnB schema ======== CHECK the type of host, photo =================
 const RoomSchema = new Schema({
    "title": String,
    "description": Text,
    "host": {
        type: String,
        unique: true
    },
    "address": String,
    "city": String,
    "placeType": String,
    "guest": Number,
    "price": Number,
    "photos": {
        "photoID": String//?????
    }
 });
 
 //here we saving our collectionSchema with the name user in database  
  //userModel will contain the instance of the user for manipulating the data.  
 module.exports = mongoose.model('Rooms', RoomSchema);
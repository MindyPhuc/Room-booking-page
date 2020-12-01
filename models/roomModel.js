/* ******************************************
 * WEB222NGG
 * Assignment
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov, 2020
 ******************************************** */

// require mongoose and setup the Schema
const mongoose = require("mongoose");

const {
    Schema
} = mongoose;

// use bluebird promise library with mongoose
mongoose.Promise = require("bluebird");

// define the BnB schema ======== CHECK the type of host, photo =================
const RoomSchema = new Schema({
    "title": String,
    "description": String,
    "address": String,
    "city": String,
    "type": String,
    "guest": Number,
    "price": Number,
    "photos": Array
});


module.exports = mongoose.model('rooms', RoomSchema);
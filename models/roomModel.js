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

// define the Room schema
const RoomSchema = new Schema({
    "title": String,
    "description": String,
    "address": String,
    "city": String,
    "type": String,
    "guest": Number,
    "price": Number,
    "host": String,
    "clean": {
        type: Boolean,
        default: true
    },
    "selfCheckIn": {
        type: Boolean,
        default: true
    },
    "photos": Array
});


module.exports = mongoose.model('rooms', RoomSchema);
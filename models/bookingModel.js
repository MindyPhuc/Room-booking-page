/* ******************************************
 * WEB222NGG
 * Assignment
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov 2020
 ******************************************** */

// require mongoose and setup the Schema
const mongoose = require("mongoose");

const {
    Schema
} = mongoose;

// use bluebird promise library with mongoose
mongoose.Promise = require("bluebird");

// define the Booking schema
const BookingSchema = new Schema({
    "user_id": String,
    "room_id": String,
    "room_title": String,
    "room_location": String,
    "check_in": Date,
    "check_out": Date,
    "day": Number,
    "guest": Number,
    "price": Number,
    "total": Number
});


module.exports = mongoose.model('bookings', BookingSchema);
/* ******************************************
 * WEB222NGG
 * Assignment 1
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: October 10, 2020
 ******************************************** */

var path = require("path");
var express = require("express"); 
var app = express(); 

var HTTP_PORT = process.env.PORT || 8080;


function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// static files
app.use(express.static("static"));

// setup routes
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"index.html"));
});

app.get("/rooms", function (req,res){
    res.sendFile(path.join(__dirname,"room-listing.html"));
});

app.get("/becomeahost", function (req,res){
    res.sendFile(path.join(__dirname,"become-host.html"));
});

app.get("/signup", function (req,res){
    res.sendFile(path.join(__dirname,"registration.html"));
});

app.get("/details", function (req,res){
    res.sendFile(path.join(__dirname,"detail-page.html"));
});

app.get("/thankyou", function (req,res){
    res.sendFile(path.join(__dirname,"thank-you.html"));
});

// setup http server to listen on HTTP_PORT (setup listener)
app.listen(HTTP_PORT, onHttpStart);


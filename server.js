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
app.use(express.static("views"));

// setup routes
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"views/index.html"));
});

app.get("/rooms", function (req,res){
    res.sendFile(path.join(__dirname,"views/room-listing.html"));
});

app.get("/become-a-host", function (req,res){
    res.sendFile(path.join(__dirname,"views/become-host.html"));
});

app.get("/signup", function (req,res){
    res.sendFile(path.join(__dirname,"views/signup.html"));
});

app.get("/details", function (req,res){
    res.sendFile(path.join(__dirname,"views/detail-page.html"));
});

app.get("/login", function (req,res){
    res.sendFile(path.join(__dirname,"views/login.html"));
});

app.get("/thankyou", function (req,res){
    res.sendFile(path.join(__dirname,"views/dashboard.html"));
});

// setup http server to listen on HTTP_PORT (setup listener)
app.listen(HTTP_PORT, onHttpStart);


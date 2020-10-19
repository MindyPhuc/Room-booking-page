/* ******************************************
 * WEB222NGG
 * Assignment 1
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: October 10, 2020
 ******************************************** */


var express = require("express"); 
var app = express(); 
var path = require("path");
var multer = require("multer");
var nodemailer = require("nodemailer");

// setup port number
var HTTP_PORT = process.env.PORT || 8080;
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// setup parameters for multer
const STORAGE = multer.diskStorage({
    destination: "./public/photos/",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }    
});

const UPLOAD = multer({storage: STORAGE});

// setup parameters for nodemailer
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tmphuynhweb322@gmail.com',
        pass: 'Web322////'
    }
});

// static files
app.use(express.static("views"));
app.use(express.static("public"));

// setup routes
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"views/index.html"));
});

app.get("/rooms", function (req,res){
    res.sendFile(path.join(__dirname,"views/rooms.html"));
});

app.get("/host", function (req,res){
    res.sendFile(path.join(__dirname,"views/host.html"));
});

app.get("/signup", function (req,res){
    res.sendFile(path.join(__dirname,"views/signup.html"));
});

app.get("/details", function (req,res){
    res.sendFile(path.join(__dirname,"views/details.html"));
});

app.get("/login", function (req,res){
    res.sendFile(path.join(__dirname,"views/login.html"));
});

app.get("/dashboard", function (req,res){
    res.sendFile(path.join(__dirname,"views/dashboard.html"));
}); 

// post data for become a host form
app.post("/host", UPLOAD.single("photo"), (req, res) => {
    const FORM_DATA = req.body;
    const FILE_DATA = req.file;

    const DATA_OUTPUT = "Your submission was received: <br> <br>" +
        "Your form data was: <br>" + JSON.stringify(FORM_DATA) + "<br> <br>" +
        "Your file data was: <br>" + JSON.stringify(FILE_DATA) + "<br> <br>" +
        "This is the uploaded image: <br>" +
        "<img src='/photos/" + FILE_DATA.filename + "'>";

    //res.send(DATA_OUTPUT);

    var emailHost = {
        from: 'tmphuynhweb322@gmail.com',
        to: FORM_DATA.email,
        subject: 'Test email',
        html: '<p> Hello ' + FORM_DATA.fName + ' ' + FORM_DATA.lName + 
             '</p> <br> <p>Thank you for your registration to become a host at MinBnB</p>'
    };
    
    transporter.sendMail(emailHost, (error, info) => {
        if (error) {
            console.log("ERROR: " + error);
        } else {
            console.log("SUCCESS: " + info.response);
        }
    });
    res.redirect('/dashboard');
});

// post data for the signup form of renters
app.post("/signup", UPLOAD.single("email"), (req,res)=> {

    const FORM_DATA = req.body;
    
    var emailRenter = {
        from: 'tmphuynhweb322@gmail.com',
        to: FORM_DATA.email,
        subject: 'MinBnB - Successful Signup',
        html: '<p> Hello ' + FORM_DATA.fName + ' ' + FORM_DATA.lName + ',' + 
             '</p><p>Thank you for signing up at MinBnB</p>'
    };
    transporter.sendMail(emailRenter, (error, info) => {
        if (error) {
            console.log("ERROR: " + error);
        } else {
            console.log("SUCCESS: " + info.response);
        }
    });
    res.redirect('/dashboard');
});

// post for the login form
app.post("/login", (req,res)=> {   
    res.redirect('/dashboard');
});


// setup http server to listen on HTTP_PORT (setup listener)
app.listen(HTTP_PORT, onHttpStart);


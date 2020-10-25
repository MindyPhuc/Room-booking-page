/* ******************************************
 * WEB222NGG
 * Assignment 2
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: October 23, 2020
 ******************************************** */

// Required Modules
var express = require("express"); 
var app = express(); 
var path = require("path");
var multer = require("multer");
var nodemailer = require("nodemailer");
const hbs = require('express-handlebars');

// setup port number
var HTTP_PORT = process.env.PORT || 8080;
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}


// setup for express-handlebars
app.engine('.hbs', hbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

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
    //res.sendFile(path.join(__dirname,"views/index.html"));
    res.render('index', ({layout: false}));
});

app.get("/rooms", function (req,res){
    //res.sendFile(path.join(__dirname,"views/rooms.html"));
    res.render('rooms', ({layout: false}));
});

app.get("/host", function (req,res){
    //res.sendFile(path.join(__dirname,"views/host.html"));
    res.render('host', ({layout: false}));
});

app.get("/signup", function (req,res){
    //res.sendFile(path.join(__dirname,"views/signup.html"));
    res.render('signup', ({layout: false}));
});

app.get("/details", function (req,res){
    //res.sendFile(path.join(__dirname,"views/details.html"));
    res.render('details', ({layout: false}));
});

app.get("/login", function (req,res){
    //res.sendFile(path.join(__dirname,"views/login.html"));
    res.render('login', ({layout: false}));
});


// we render the file instead
/* app.get("/dashboard", function (req,res){
    res.sendFile(path.join(__dirname,"views/dashboard.html"));
}); */ 



// post data for become a host form
app.post("/host", UPLOAD.single("photo"), (req, res) => {
    const FORM_DATA = req.body;
    const FILE_DATA = req.file;

   /*  const DATA_OUTPUT = "Your submission was received: <br> <br>" +
        "Your form data was: <br>" + JSON.stringify(FORM_DATA) + "<br> <br>" +
        "Your file data was: <br>" + JSON.stringify(FILE_DATA) + "<br> <br>" +
        "This is the uploaded image: <br>" +
        "<img src='/photos/" + FILE_DATA.filename + "'>"; */

    
    
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

    // render dashboard page
    res.render('dashboard', {
        data: FORM_DATA,
        layout: false
    });
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

    // render dashboard page
    res.render('dashboard', {
        data: FORM_DATA,
        layout: false
    });
});

// post for the login form
app.post("/login", UPLOAD.single("username"), (req,res)=> {
    FORM_DATA = req.body;

    // render dashboard page
    res.render('dashboard', {
        data: FORM_DATA,
        layout: false
    });
});

// post for the Book Now form
app.post("/details", (req,res)=> {
    FORM_DATA = req.body;

    // render dashboard page
    res.render('dashboard', {
        data: FORM_DATA,
        layout: false
    });
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);


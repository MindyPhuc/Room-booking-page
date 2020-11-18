/* ******************************************
 * WEB222NGG
 * Assignment 2
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: October 23, 2020
 ******************************************** */

// Required Modules
const express = require("express"); 
const app = express(); 
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
const hbs = require('express-handlebars');
//const {check} = require('express-validator');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//const router = express.Router(); // later

const config = require('./views/scripts/config'); // need to change !!!!!!!!!!!!!!

// import custom Module
const userModel = require("./models/userModel");
//const userController = require('./controllers/userController');
//var roomModel = require("./models/roomModel");
//var photoModel = require("./models/photoModel");


// setup port number
var HTTP_PORT = process.env.PORT || 8080;
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// static files
app.use(express.static("views"));
app.use(express.static("public"));

//app.use(bodyParser.json());
//app.use(expressValidator());
//app.use('/api', router)

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

//=========== CONNECT TO DATABASE ==========================
mongoose.connect(config.DB_CONN_STR, { useNewUrlParser: true }, { useUnifiedTopology: true });
mongoose.connection.on('error', err => {console.log("Failed to connect - ${err}");});
mongoose.connection.once('open', () => {console.log("Connected successfully!")});


//===================== ROUTES =============================

//----- GET -----
app.get("/", function(req,res){    
    res.render('home', ({layout: false}));
});

app.get("/rooms", function (req,res){    
    res.render('rooms', ({layout: false}));
});


app.get("/registration", function (req,res){   
    res.render('registration', ({layout: false}));
});

app.get("/details", function (req,res){    
    res.render('details', ({layout: false}));
});

app.get("/login", function (req,res){    
    res.render('login', ({layout: false}));
});

app.get("/user-dashboard", function (req,res){    
    res.render('user-dashboard', ({layout: false}));
});

app.get("/admin-dashboard", function (req,res){    
    res.render('admin-dashboard', ({layout: false}));
});


// ---- POST ------
// post data for the registration form to create a user in the database
app.post('/registration', UPLOAD.single("email"), (req, res) => {  
    const form_data = req.body;  
   
    // server-side validation (email and username must be valid)
    function isEmail(email) {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;        
        return reg.test(email);
    }
    function validate(data) {
        return (
            data.username && data.email && isEmail(data.email)           
        )
    }
    // if the data is valid
    if(validate(form_data)) {    
     
        // add the user if the it does not exist
        userModel.findOne({ $or: [{username: form_data.username}, {email: form_data.email}]}) // unique username, email
                    .exec()
                    .then(user => {
                        if(!user) { 
                            // add new user to the database
                            const newUser = new userModel({  
                                fName: form_data.fName,
                                lName: form_data.lName,
                                email: form_data.email,
                                username: form_data.username,
                                password: form_data.password   
                            });
                            newUser.save(error=> {
                                if(error){  
                                    console.log('error occurred',err)  
                                }  
                                else{                                       
                                    res.render('user-dashboard',{
                                        data: form_data,
                                        layout: false
                                    })
                                    // send confirmation email
                                    var emailRenter = {
                                        from: 'tmphuynhweb322@gmail.com',
                                        to: form_data.email,
                                        subject: 'MinBnB - Successful Sign up',
                                        html: '<p> Hello ' + form_data.fName + ' ' + form_data.lName + ',' + 
                                             '</p><p>Thank you for signing up at MinBnB</p>'
                                    };
                                    transporter.sendMail(emailRenter, (error, info) => {
                                        if (error) {
                                            console.log("ERROR: " + error);
                                        } else {
                                            console.log("SUCCESS: " + info.response);
                                        }
                                    });
                                }
                            })                           
                                         
                        } else {
                            console.log("User exists");
                            
                            res.render('registration', {
                                exist: true,
                                layout: false
                            })
                        }                        
                    })
                    .catch(error => {
                        console.log("ERROR: " + error);
                    });       
           
    } else {
        console.log("Invalid input data");
        res.redirect('home');
    }
  
})

/*
app.post("/registration", UPLOAD.single("email"), (req,res)=> {

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
    res.render('user-dashboard', {
        data: FORM_DATA,
        layout: false
    });
});*/

// post for the login form
app.post("/login", UPLOAD.single("username"), (req,res)=> {
    FORM_DATA = req.body;

    // render dashboard page
    res.render('user-dashboard', {
        data: FORM_DATA,
        layout: false
    });
});

// post for the Book Now form
app.post("/details", (req,res)=> {
    FORM_DATA = req.body;

    // render dashboard page
    res.render('user-dashboard', {
        data: FORM_DATA,
        layout: false
    });
});



// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);


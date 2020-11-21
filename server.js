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
const _ = require ("underscore");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const clientSessions = require('client-sessions');
//const router = express.Router(); // later

const config = require('./views/scripts/config'); // need to change .env file !!!!!!!!!!!!!!
const PHOTODIRECTORY = "./public/photos/";

// import custom Module
const userModel = require("./models/userModel");
const photoModel = require("./models/photoModel");
//const userController = require('./controllers/userController');
const roomModel = require("./models/roomModel");



// setup port number
var HTTP_PORT = process.env.PORT || 8080;
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// static files
app.use(express.static("views"));
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: false}));

app.use(clientSessions({
    cookieName: 'session',
    secret: 'web322_assignment_session',
    duration: 2*60*1000,
    activeDuration: 3*60*1000
}));


// setup for express-handlebars
app.engine('.hbs', hbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

// make sure the photos folder exists
// if not create it
if (!fs.existsSync(PHOTODIRECTORY)) {
    fs.mkdirSync(PHOTODIRECTORY);
}
// setup parameters for multer
const STORAGE = multer.diskStorage({
    destination: PHOTODIRECTORY,
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }    
});

const upload = multer({storage: STORAGE});

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
mongoose.connection.once('open', () => {console.log("Connected to MongoDB")});

//===== validate functions ==========    
function validateUser(req, res, next) {
   if(!req.body.username || !req.body.email || !req.body.password) {
       res.render('registration',{errorMsg: "Invalid inputs, please try again", layout: false});
   } else {
       next();
   }
}

function checkLogin(req,res, next) {
    if(!req.session.user) {
        res.render('login', {errorMsg: "Unauthorized access, please login", layout: false});
    } else {
        next();
    }
}

//===================== ROUTES =============================

//----- GET -----
app.get("/", function(req,res){    
    res.render('home', ({user: req.session.user, layout: false}));
});

app.get("/rooms", function (req,res){
    roomModel.find().lean()
        .exec()
        .then(rooms => {            
            res.render("rooms", { rooms : rooms, hasRooms: !!rooms.length, user: req.session.user, layout: false });                                
        })
        .catch(error => {
            console.log("ERROR: " + error);
        });  
    
});


app.get("/registration", function (req,res){   
    res.render('registration', ({layout: false}));
});

app.get("/details", function (req,res){    
    res.render('details', ({user: req.session.user, layout: false}));
});

app.get("/login", function (req,res){    
    res.render('login', ({layout: false}));
});

app.get("/user-dashboard", checkLogin, function (req,res){    
    res.render('user-dashboard', ({user: req.session.user, layout: false}));
});

app.get("/admin-dashboard", function (req,res){    
    res.render('admin-dashboard', ({layout: false}));
});
// ---- POST ------
// =========== REGISTRATION =====================
app.post('/registration', validateUser, (req, res) => { 
           
    // add the user if the it does not exist
    userModel.findOne({ $or: [{username: req.body.username}, {email: req.body.email}]}) // unique username, email
        .exec()
        .then(user => {
            if(!user) { 
                // add new user to the database
                const newUser = new userModel({  
                    fName: req.body.fName,
                    lName: req.body.lName,
                    email: req.body.email,
                    username: req.body.username,
                    password: req.body.password   
                });
                newUser.save(error=> {
                    if(error){  
                        console.log('Error occurred! - ',err)
                        res.render('registration', {errorMsg: "Error occurred! - Please try again", layout: false});
                    }  
                    else {                                       
                        res.render('user-dashboard',{data: req.body, layout: false});
                        // send confirmation email
                        var emailRenter = {
                            from: 'tmphuynhweb322@gmail.com',
                            to: req.body.email,
                            subject: 'MinBnB - Successful Sign up',
                            html: '<p> Hello ' + req.body.fName + ' ' + req.body.lName + ',' + 
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
                                
            } else { // either username or email existed
                console.log("User exists");                            
                res.render('registration',{errorMsg: "Either username or email is already used. Please try again.", layout: false});
                    
            }                        
        })
        .catch(error => {
            console.log("ERROR: " + error);
        });  
});

// ====== LOG IN ==============
app.post('/login', (req,res) => {

    const username = req.body.username;
    const password = req.body.password;

    if(username === "" || password === "") {
        return res.render('login', {errorMsg: "Both username and password are required!", layout: false});
    }

    // find the user from the database
    userModel.findOne({username: username})
    .exec()
    .then(user => {
        if(!user){
            res.render('login', {errorMsg: "Incorrect username or password. Please try again", layout: false});
        }
        const passwordOK = user.comparePassword(password);

        if(passwordOK) {
            req.session.user = {
                username: user.username,
                email: user.email,
                fName: user.fName,
                lName: user.lName
            };
            res.render('user-dashboard', {user: req.session.user, layout: false});
        }      
           
    })
    .catch(error => {
        console.log("ERROR: " + error);
    });
     
});

app.get('/logout', checkLogin, (req, res) => {
    req.session.reset();
    res.redirect('/');
});

/*
// ===== ADMIN ===============
app.get("/admin-dashboard", (req, res) => {
    photoModel.find().lean()
    .exec()
    .then((photos) => {      
      _.each(photos, (photo) => {
        photo.uploadDate = new Date(photo.createdOn).toDateString();
      });
  
      // send the html view with our form to the client
      res.render("admin-dashboard", { photos : photos, hasPhotos: !!photos.length, layout: false });
    });
  });

// add photo - GET
app.get("/add-photo", (req, res) => {
    // send the html view with our form to the client
    res.render("add-photo", { 
      layout: false // do not use the default Layout (main.hbs)
    });
});

// add photo - POST
app.post("/add-photo", upload.single("photo"), (req, res) => {
    // setup a PhotoModel object and save it
    const locals = { 
      message: "Your photo was uploaded successfully",
      layout: false // do not use the default Layout (main.hbs)
    };
  
    const photoMetadata = new photoModel({ 
      room: req.body.room,       
      caption: req.body.caption,
      filename: req.file.filename
    });
  
    photoMetadata.save()
    .then((response) => {
      res.render("add-photo", locals);
    })
    .catch((err) => {
      locals.message = "There was an error uploading your photo";  
      console.log(err);  
      res.render("add-photo", locals);
    });
  });

*/


// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);


/* ******************************************
 * WEB222NGG
 * Assignment 3
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov 2020
 ******************************************** */

var express = require('express');
var router = express.Router();

/* GET listing. */
/* router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  }); */

// Routes listing
router.get("/", function(req,res){    
    res.render('index', ({layout: false}));
});

/* router.get("/rooms", function (req,res){    
    res.render('rooms', ({layout: false}));
});

router.get("/host", function (req,res){
    res.render('host', ({layout: false}));
});

router.get("/signup", function (req,res){    
    res.render('signup', ({layout: false}));
});

router.get("/details", function (req,res){    
    res.render('details', ({layout: false}));
});

router.get("/login", function (req,res){    
    res.render('login', ({layout: false}));
});
 */

/* 
// post data for become a host form
router.post("/host", UPLOAD.single("photo"), (req, res) => {
    const FORM_DATA = req.body;
    const FILE_DATA = req.file;

    const DATA_OUTPUT = "Your submission was received: <br> <br>" +
        "Your form data was: <br>" + JSON.stringify(FORM_DATA) + "<br> <br>" +
        "Your file data was: <br>" + JSON.stringify(FILE_DATA) + "<br> <br>" +
        "This is the uploaded image: <br>" +
        "<img src='/photos/" + FILE_DATA.filename + "'>"; 

    
    
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
router.post("/signup", UPLOAD.single("email"), (req,res)=> {

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

    // render dashboard page ????????? different pages for host, renter
    res.render('dashboard', {
        data: FORM_DATA,
        layout: false
    });
});

// post for the login form
router.post("/login", UPLOAD.single("username"), (req,res)=> {
    FORM_DATA = req.body;

    // render dashboard page
    res.render('dashboard', {
        data: FORM_DATA,
        layout: false
    });
});

// post for the Book Now form
router.post("/details", (req,res)=> {
    FORM_DATA = req.body;

    // render dashboard page
    res.render('dashboard', {
        data: FORM_DATA,
        layout: false
    });
}); */

// export routes
module.exports = router;
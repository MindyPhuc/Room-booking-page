/* ******************************************
 * WEB222NGG
 * Assignment 2
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: October 23, 2020
 ******************************************** */

/* #region REQUIRES */
require('dotenv').config();
const express = require("express");

const app = express();

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const clientSessions = require('client-sessions');
const userModel = require("./models/userModel");
const roomModel = require("./models/roomModel");

/* #endregion */

// #region CONFIGURATIONS


var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

mongoose.connect(process.env.DB_CONN_STR, {
    useNewUrlParser: true
}, {
    useUnifiedTopology: true
});
mongoose.connection.on('error', err => {
    console.log("Failed to connect - ${err}");
});
mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB")
});


app.engine('.hbs', hbs({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// static files
app.use(express.static("views"));
app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(clientSessions({
    cookieName: 'session',
    secret: 'web322_assignment_session',
    duration: 2 * 60 * 1000,
    activeDuration: 3 * 60 * 1000
}));

const PHOTODIRECTORY = "./public/photos/";
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

const upload = multer({
    storage: STORAGE
});

// setup parameters for nodemailer
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tmphuynhweb322@gmail.com',
        pass: 'Web322////'
    }
});

// #endregion


// #region SECURITY

// check valid user information
function validateUser(req, res, next) {
    if (!req.body.username || !req.body.email || !req.body.password) {
        res.render('registration', {
            errorMsg: "Invalid inputs, please try again",
            layout: false
        });
    } else {
        next();
    }
}

// check login
function checkLogin(req, res, next) {
    if (!req.session.user) {
        res.render('login', {
            errorMsg: "Unauthorized access, please login",
            layout: false
        });
    } else {
        next();
    }
}

// check admin
function checkAdmin(req, res, next) {
    if (!req.body.isAdmin) {
        res.render('login', {
            errorMsg: "Unauthorized access, please login as Administrator",
            layout: false
        });
    } else {
        next();
    }
}
// #endregion

// #region ROUTES

app.get("/", (req, res) => {
    res.render('home', ({
        user: req.session.user,
        layout: false
    }));
});


app.get("/registration", (req, res) => {
    res.render('registration', ({
        layout: false
    }));
});

app.get("/details", (req, res) => {
    res.render('details', ({
        user: req.session.user,
        layout: false
    }));
});

app.get("/login", (req, res) => {
    res.render('login', ({
        layout: false
    }));
});

app.get("/user-dashboard", checkLogin, (req, res) => {
    res.render('user-dashboard', ({
        user: req.session.user,
        layout: false
    }));
});

app.get("/admin-dashboard", (req, res) => {
    res.render('admin-dashboard', ({
        layout: false
    }));
});


app.post('/registration', validateUser, (req, res) => {

    // add the user if the it does not exist
    userModel.findOne({
            $or: [{
                username: req.body.username
            }, {
                email: req.body.email
            }]
        })
        .lean() // unique username, email
        .exec()
        .then(user => {
            if (!user) {
                // add new user to the database
                const newUser = new userModel({
                    fName: req.body.fName,
                    lName: req.body.lName,
                    email: req.body.email,
                    username: req.body.username,
                    password: req.body.password
                });
                newUser.save(error => {
                    if (error) {
                        console.log('Error occurred! - ', err)
                        res.render('registration', {
                            errorMsg: "Error occurred! - Please try again",
                            layout: false
                        });
                    } else {
                        res.render('user-dashboard', {
                            data: req.body,
                            layout: false
                        });
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
                res.render('registration', {
                    errorMsg: "Either username or email is already used. Please try again.",
                    layout: false
                });

            }
        })
        .catch(error => {
            console.log("ERROR: " + error);
        });
});

// #region LOGIN - LOGOUT

app.post('/login', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (username === "" || password === "") {
        return res.render('login', {
            errorMsg: "Both username and password are required!",
            layout: false
        });
    }

    // find the user from the database
    userModel.findOne({
            username: username
        })
        .exec()
        .then(user => {
            if (!user) {
                res.render('login', {
                    errorMsg: "Incorrect username or password. Please try again",
                    layout: false
                });
            }
            const passwordOK = user.comparePassword(password);
            if (passwordOK) {
                req.session.user = {
                    username: user.username,
                    email: user.email,
                    fName: user.fName,
                    lName: user.lName,
                    isAdmin: user.isAdmin
                };
                if (user.isAdmin) {
                    res.render('admin-dashboard', {
                        user: req.session.user,
                        layout: false
                    });
                } else {
                    res.render('user-dashboard', {
                        user: req.session.user,
                        layout: false
                    });
                }

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
// #endregion

// #region ROOMS

// dynamic content - rooms page
app.get("/rooms", (req, res) => {
    roomModel.find()
        .lean()
        .exec()
        .then(rooms => {
            res.render("rooms", {
                rooms: rooms,
                hasRooms: !!rooms.length,
                user: req.session.user,
                layout: false
            });
        })
        .catch(error => {
            console.log("ERROR: " + error);
        });

});

app.get("/rooms/Edit", checkLogin, (req, res) => {
    res.render("roomEdit", {
        user: req.session.user,
        layout: false
    });
})

app.get("/rooms/Edit/:roomID", checkLogin, (req, res) => {
    const roomID = req.params.roomID;

    roomModel.findOne({
            _id: roomID
        })
        .lean()
        .exec()
        .then((room) => {
            res.render("roomEdit", {
                user: req.session.user,
                room: room,
                editMode: true,
                layout: false
            });
        })
        .catch(error => {
            console.log(error);
        });
});

app.get("/rooms/Delete/:roomID", checkLogin, (req, res) => {
    const roomID = req.params.roomID;
    roomModel.deleteOne({
            _id: roomID
        })
        .then(() => {
            res.redirect("/rooms");
        });
})

app.post('/rooms/Edit', checkLogin, upload.single("photo"), (req, res) => {

    if (req.body.edit === "1") {
        //editing
        const room = new roomModel({
            _id: req.body.ID,
            title: req.body.title,
            description: req.body.description,
            address: req.body.address,
            city: req.body.city,
            type: req.body.type,
            guest: req.body.guest,
            price: req.body.price
        })
        roomModel.updateOne({
                _id: room._id
            }, {
                $set: {
                    title: room.title,
                    description: room.description,
                    address: room.address,
                    city: room.city,
                    type: room.type,
                    guest: room.guest,
                    price: room.price,
                }
            })
            .exec()
            .then(() => {
                res.redirect('/rooms');

            })
            .catch(error => {
                console.log("ERROR: " + error);
            });
    } else {
        // adding
        const room = new roomModel({
            title: req.body.title,
            description: req.body.description,
            address: req.body.address,
            city: req.body.city,
            type: req.body.type,
            guest: req.body.guest,
            price: req.body.price,
            photos: req.file.filename
        });
        room.save(error => {
            if (error) {
                console.log('Error occurred! - ', error)
                res.render('rooms/Edit', {
                    errorMsg: "Error occurred! - Please try again",
                    layout: false
                });
            } else {
                res.redirect("/rooms");
            }
        })
    }

});


// #region PHOTOS
app.get("/:roomID/photos/Add", checkLogin, (req, res) => {
    res.render("photoAdd", {
        user: req.session.user,
        roomID: req.params.roomID,
        layout: false
    });


});
app.post("/:roomID/photos/Add", checkLogin, upload.single("photo"), (req, res) => {
    const roomID = req.params.roomID;
    const addedPhoto = req.file.filename;

    roomModel.findOne({
            _id: roomID
        })
        .exec()
        .then(room => {
            room.photos.push(addedPhoto);

            roomModel.updateOne({
                    _id: roomID
                }, {
                    $set: {
                        photos: room.photos
                    }
                })
                .exec()
                .then(() => {
                    res.redirect(`../../${roomID}/photos`);
                })
                .catch(error => {
                    console.log(error);
                });

        })
        .catch(error => {
            console.log(error);
        });


});

app.get("/:roomID/photos", (req, res) => {
    const roomID = req.params.roomID;
    roomModel.findOne({
            _id: roomID
        })
        .lean()
        .exec()
        .then(room => {
            res.render("photos", {
                user: req.session.user,
                room: room,
                photos: room.photos,
                hasPhotos: !!room.photos.length,
                layout: false
            });
        })
        .catch(error => {
            console.log(error);
        });
});

app.get("/:roomID/photos/Delete/:fileName", checkLogin, (req, res) => {
    const photoFileName = req.params.fileName;

    const roomID = req.params.roomID;
    roomModel.findOne({
            _id: roomID
        })
        .exec()
        .then(room => {
            const photos = room.photos;
            const newPhotos = photos.filter((value, index, arr) => {
                return value !== photoFileName;
            });

            roomModel.updateOne({
                    _id: room._id
                }, {
                    $set: {
                        photos: newPhotos
                    }
                })
                .exec()
                .then(() => {
                    res.redirect(`../../../${roomID}/photos`);
                });
        })
        .catch(error => {
            console.log(error);
        });
})

// #endregion

// dynamic content - room-details page
app.get('/rooms/:room_id', (req, res) => {
    var id = req.params.room_id;
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    roomModel.findOne({
            _id: id
        }).lean()
        .exec()
        .then(room => {
            res.render("room-details", {
                room: room,
                photos: room.photos,
                user: req.session.user,
                layout: false
            });
        })
        .catch(error => {
            console.log("ERROR: " + error);
        });
});

// search for rooms by location
app.post("/rooms/search", (req, res) => {
    req.params.location = req.body.location;
    roomModel.find({
            city: req.params.location
        })
        .lean()
        .exec()
        .then(rooms => {
            res.render("rooms", {
                rooms: rooms,
                hasRooms: !!rooms.length,
                layout: false
            })
        })
        .catch(error => {
            console.log(error);
        });

});

// #endregion

// #endregion



// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
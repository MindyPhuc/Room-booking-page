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
const _ = require("underscore");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const clientSessions = require('client-sessions');
const createError = require('http-errors');
const userModel = require("./models/userModel");
const roomModel = require("./models/roomModel");
const bookingModel = require("./models/bookingModel");
const {
    templateSettings
} = require('underscore');

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
        user: process.env.EMAIL,
        pass: process.env.PASS
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
    if (!req.session.user || !req.session.user.isAdmin) {
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


app.get("/dashboard", checkLogin, (req, res) => {
    const user = req.session.user;
    if (user && !user.isAdmin) {
        bookingModel.find({
                user_id: user._id
            })
            .lean()
            .exec()
            .then(bookings => {
                _.each(bookings, (booking) => {
                    booking.dateIn = new Date(booking.check_in).toDateString();
                    booking.dateOut = new Date(booking.check_out).toDateString();
                });
                res.render("dashboard", {
                    bookings: bookings,
                    hasBookings: !!bookings.length,
                    user: user,
                    layout: false
                });
            })
            .catch(error => {
                console.log(error);
            });
    } else {
        res.render("dashboard", {
            user: user,
            layout: false
        });
    }
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
                        console.log('Error occurred! - ', error)
                        res.render('registration', {
                            errorMsg: "Error occurred! - Please try again",
                            layout: false
                        });
                    } else {
                        res.redirect("login");
                        // send confirmation email
                        var emailRenter = {
                            from: process.env.EMAIL,
                            to: newUser.email,
                            subject: 'MinBnB - Successful Sign up',
                            html: '<p> Hello ' + newUser.fName + ' ' + newUser.lName + ',' +
                                '</p><p>Thank you for signing up at MinBnB</p>'
                        };
                        transporter.sendMail(emailRenter, (err, info) => {
                            if (err) {
                                console.log("ERROR: " + err);
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
app.get("/login", (req, res) => {
    res.render('login', ({
        layout: false
    }));
});

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
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    fName: user.fName,
                    lName: user.lName,
                    isAdmin: user.isAdmin
                };
                res.render('dashboard', {
                    user: req.session.user,
                    layout: false
                });

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

app.get("/rooms/Edit", checkLogin, checkAdmin, (req, res) => {
    res.render("roomEdit", {
        user: req.session.user,
        layout: false
    });
})

app.get("/rooms/Edit/:roomID", checkLogin, checkAdmin, (req, res) => {
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

app.post("/rooms/Delete/:roomID", checkLogin, checkAdmin, (req, res) => {
    const roomID = req.params.roomID;
    roomModel.deleteOne({
            _id: roomID
        })
        .then(() => {
            res.redirect("/rooms");
        });
})

app.post('/rooms/Edit', checkLogin, checkAdmin, upload.single("photo"), (req, res) => {

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

// #region PHOTOS
app.get("/:roomID/photos/Add", checkAdmin, (req, res) => {
    res.render("photoAdd", {
        user: req.session.user,
        roomID: req.params.roomID,
        layout: false
    });


});
app.post("/:roomID/photos/Add", checkAdmin, upload.single("photo"), (req, res) => {
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

app.get("/:roomID/photos", checkAdmin, (req, res) => {
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

app.post("/:roomID/photos/Delete/:fileName", checkAdmin, (req, res) => {
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

// #region BOOKINGS
app.post("/booking", checkLogin, (req, res) => {
    const userID = req.body.user_id;
    const roomID = req.body.room_id;
    const dateIn = new Date(req.body.check_in);
    const dateOut = new Date(req.body.check_out);
    const days = Math.ceil((dateOut.getTime() - dateIn.getTime()) / (1000 * 3600 * 24));
    const newBooking = new bookingModel({
        room_id: roomID,
        user_id: userID,
        check_in: dateIn,
        check_out: dateOut,
        day: days,
        guest: req.body.guest
    });
    roomModel.findOne({
            _id: roomID
        })
        .exec()
        .then(room => {
            newBooking.room_title = room.title;
            newBooking.room_location = room.city;
            newBooking.price = room.price;
            newBooking.total = newBooking.day * room.price;
            const booking = {
                _id: newBooking._id,
                user_id: newBooking.user_id,
                room_id: newBooking.room_id,
                room_title: newBooking.room_title,
                room_location: newBooking.room_location,
                check_in: newBooking.check_in,
                check_out: newBooking.check_out,
                day: newBooking.day,
                guest: newBooking.guest,
                price: newBooking.price,
                total: newBooking.total,
                dateIn: new Date(newBooking.check_in).toDateString(),
                dateOut: new Date(newBooking.check_out).toDateString()
            }
            res.render("bookingConfirm", {
                user: req.session.user,
                booking: booking,
                layout: false
            });
        })
        .catch(error => {
            console.log(error);
        });
});

app.post("/booking/confirm", checkLogin, (req, res) => {
    const user_id = req.body.user_id;
    const room_id = req.body.room_id;
    const booking = new bookingModel({
        _id: req.body._id,
        user_id: user_id,
        room_id: room_id,
        check_in: req.body.check_in,
        check_out: req.body.check_out,
        day: req.body.day,
        guest: req.body.guest,
        room_title: req.body.room_title,
        room_location: req.body.room_location,
        price: req.body.price,
        total: req.body.total
    });
    userModel.findOne({
            _id: user_id
        })
        .exec()
        .then(user => {
            booking.save(error => {
                if (error) {
                    console.log('Error occurred! - ', error)
                    res.redirect("/");
                } else {
                    res.redirect("/dashboard");
                    booking.dateIn = new Date(booking.check_in).toDateString();
                    booking.dateOut = new Date(booking.check_out).toDateString();
                    // send confirmation email
                    var emailRenter = {
                        from: process.env.EMAIL,
                        to: user.email,
                        subject: 'MinBnB - Successful Booking',
                        html: '<h2> Hello ' + user.fName + ' ' + user.lName + ',' +
                            '</h2><p>You are successfully booking a room at MinBnB. Below is your booking details: </p>' +
                            `<p>Room: ${booking.room_title}</p>
                            <p>Check in: ${booking.dateIn}</p>
                            <p>Check out: ${booking.dateOut}</p>
                            <p>Number of guests: ${booking.guest}</p>
                            <p> Price: $${booking.price}</p>
                            <p>Days: ${booking.day}</p>
                            <p> Total: $${booking.total}</p>
                            <p> Thank you for using our service</p>
                            <p> Have a great trip, <p>
                            <p>MinBnB</p>`
                    };
                    transporter.sendMail(emailRenter, (err, info) => {
                        if (err) {
                            console.log("ERROR: " + err);
                        } else {
                            console.log("SUCCESS: " + info.response);
                        }
                    });
                }
            })
        })
        .catch(error => {
            console.log(error);
        });

});

// #endregion

// #region ERROR HANDLING
app.use((req, res, next) => {
    return next(createError(404, 'File not found'));
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    const status = err.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error', {
        layout: false
    });
});

app.get("/error", (req, res) => {
    res.render('error', {
        layout: false
    });
});

// #endregion
// #endregion

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
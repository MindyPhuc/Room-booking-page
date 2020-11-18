/* ******************************************
 * WEB222NGG
 * Assignment
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov, 2020
 ******************************************** */

 // require mongoose and setup the Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// use bluebird promise library with mongoose
mongoose.Promise = require("bluebird");

// define the user schema (normal user)
// admin user will have an extra field: "admin": true
const UserSchema = new Schema({ 
  "fName": String,
  "lName": String,
  "email": {
    type: String,
    unique: true
  },
  "username": {
    type: String,
    unique: true
  },
  "password": String // update when encrypting
});

// export userModel
// collection name: Users
module.exports = mongoose.model('Users', UserSchema);


//===================== CHECK ???????????? =========================
/*
 //this function will find all the user   
//there will be just a callback parameter  
module.exports.getUser=(cb)=>{  
  userModel.find((err,data)=>{  
      if(err){  
          console.log(err);  
      }  
      else{  
          cb(null,data); 
      }  
  })  
} */

//this will add new user to the user collection  
//this will take 2 parameter.newUser is object and cb is a callback  
/*module.exports.addUser=(newUser,cb)=>{  
  const user = new userModel({    
    username: newUser.username,
    fName: newUser.fName,
    lName: newUser.lName,
    email: newUser.email,
    password: newUser.password   
  })  
  user.save(cb)  
}*/

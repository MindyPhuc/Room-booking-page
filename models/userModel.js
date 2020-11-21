/* ******************************************
 * WEB222NGG
 * Assignment
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov, 2020
 ******************************************** */

 // require mongoose and setup the Schema
const mongoose = require("mongoose");
const emailValidator = require("email-validator");
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

const Schema = mongoose.Schema;

// use bluebird promise library with mongoose
mongoose.Promise = require("bluebird");

// define the user schema (normal user)
// admin user will have an extra field: "admin": true
const UserSchema = new Schema({ 
  "fName": {
    type: String,
    trim: true
  },
  "lName": {
    type: String,
    trim: true
  },
  "email": {
    type: String,    
    required: true,
    unique: true,
    trim: true,
    lowercase: true,  // case insensitive
    index: {unique: true},
    validate: {
      validator: emailValidator.validate,
      message: props => `${props.value} is not a valid email address!`,
    }
  },
  "username": {
    type: String,
    unique: true,   
    required: true,
    trim: true,
    index: {unique: true},
    minlength: 3
  },
  "password":   {
    type: String,       
    required: true,
    trim: true,
    index: {unique: true},
    minlength: 8
  },
});

// encrypt password
UserSchema.pre('save', async function preSave(next){
  const user = this;
  if(!user.isModified('password')) return next();
  try {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    user.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
}

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

/* ******************************************
 * WEB222NGG
 * Assignment
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov, 2020
 ******************************************** */
const User = require('./models/userModel')

const { body } = require('express-validator/check')

// server-side validation
exports.validate = (method) => {
  switch (method) {
    case 'createUser': {
     return [ 
        body('username', 'username does not exists').exists(),
        body('email', 'Invalid email').exists().isEmail(),
        body('fName', 'first name does not exists').exists(),
        body('lName', 'last name does not exists').exists(),
        body('password', 'password does not exists').exists() // update when encrypting
     ]
    }
  }
}

const { validationResult } = require('express-validator/check');

// create a user
exports.createUser = async (req, res, next) => {
   try {
      const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const { fName, lName, email, username, password } = req.body
      
      const user = await User.create({
           fName,
           lName,
           email,
           username,
           password
      })
      res.json(user)
   } catch(err) {
     return next(err)
   }
}

//============ CHECK????????========================

 /* 
//contain the function with business logics  
var userController = {   
       userHome(req,res){  
           //this will call the getUser function present in user.js   
           userModel.getUser((err,data)=>{  
               try {  
                 if(err){  
                    console.log(err)  
                 }     
                 else if(data){  
                   res.render('home',{data:data})  
                 }  
                 else{  
                     res.render('home',{data:{}})  
                 }  
               } catch (error) {  
                console.log(error)  
               }  
           })  
    },  
     addUsers(req,res){  
         try {  
         console.log('addUser',req.body)  
        const user = {  
            username: newUser.username,
            fname: newUser.fname,
            lname: newUser.lname,
            email: newUser.email,
            password: newUser.password,            
        };   
           //this will call the addUser function present in userModel.js.  
           //it will take object as parameter.   
       userModel.addUser(user,(err,data)=>{  
           if(err){  
               console.log('error occurred',err)  
           }  
           else{  
               console.log(data)  
             res.redirect('/user/home')  
           }  
       })  
    }  
        catch (error) {  
                 console.log('error',error)      
        }  
 }  
  
}*/  
  
module.exports = userController;
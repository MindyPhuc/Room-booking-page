/* ******************************************
 * WEB222NGG
 * Assignment
 * Name: Thi My Phuc Huynh (Mindy).
 * Student ID: 149792186.
 * Date: Nov, 2020
 ******************************************** */



router.post(
    '/registration', 
    userController.validate('createUser'), 
    userController.createUser,
  )

module.exports = router;

// ========= CHECK ==========================
/*
var express =  require('express');  
var userController = require('../controllers/userController');  
  
// express.Router is a class to create route handlers  
//router will contain the Router instance.  
var router = express.Router();  
  
//this route will be executed on /user/home request  
//userHome function will be called from the controller when request come for this route.  
 router.get('/home',userController.userHome)  
  
//this route will be executed on /user/add  
//addUsers function will be called from the controller when request come for this route.  
 router.post('/add',userController.addUsers)  
  
module.exports = router; */
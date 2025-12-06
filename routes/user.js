const express = require('express')
const router = express.Router();
const userController = require('../controller/userController');
const auth = require('../middleware/auth')
const session = require('express-session');

router.use(session({
    secret:'mysecretkey',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:1000*60*60
    }
}))

router.get('/login',auth.isLogin,userController.loadLogin)

router.post('/login',userController.login)

router.get('/home',auth.verifyUserSession,userController.loadHome)

router.get('/register',auth.isLogin,userController.loadRegister)

router.post('/register',userController.registerUser)

router.get('/logout',auth.checkSession,userController.logout)





module.exports = router
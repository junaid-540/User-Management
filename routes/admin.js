const express = require('express');
const router = express.Router();
const adminContoller = require('../controller/adminController')
const adminAuth = require('../middleware/adminAuth');
const userModal = require('../model/userModal');



router.get('/login',adminAuth.isLogin,adminContoller.loadLogin);


router.post('/login',adminContoller.login);

router.post('/search',adminAuth.checkSession,adminContoller.searchUser)

router.get('/dashboard',adminAuth.checkSession,adminContoller.loadDashboard);

router.post('/edit/:id',adminAuth.checkSession,adminContoller.editUser)

router.delete('/delete/:id',adminAuth.checkSession,adminContoller.deleteUser)

router.post('/add',adminAuth.checkSession,adminContoller.addUser)

router.post('/logout',adminAuth.checkSession,adminContoller.logout)


module.exports = router
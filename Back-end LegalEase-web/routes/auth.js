const express = require('express');
const {
    signup,
    login,
    getMe,
    updateDetails,
    updatePassword,
    logout
}=require('../controllers/authController');
const{protect}=require('../middleware/auth');

const router=express.Router();
router.post('/signup',signup);
router.post('/login',login);
router.get('/me',protect,getMe);
router.put('/update',protect,updatePassword);
router.put('/update',protect,updateDetails);
router.put('/logout',logout)
module.exports=router;
const express = require('express');
const router  = express.Router();
const {
  register, login, getMe, updateProfile,
  changePassword, forgotPassword, resetPassword, logout,
} = require('../controllers/authController');
const { protect }                 = require('../middlewares/authMiddleware');
const { uploadAvatar }            = require('../config/cloudinary');
const {
  registerValidation, loginValidation,
  forgotPasswordValidation, resetPasswordValidation,
} = require('../validators/authValidators');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login',    loginValidation,    login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, resetPassword);

// Protected routes
router.use(protect);
router.get('/me',              getMe);
router.put('/profile',         uploadAvatar.single('avatar'), updateProfile);
router.put('/change-password', changePassword);
router.post('/logout',         logout);

module.exports = router;

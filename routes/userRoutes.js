const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const authController = require('../controllers/authController.js');
const reviewController = require('../controllers/reviewController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.get('/', userController.getAllUser);
// router.route('/').get(userController.getAllUser).post(userController.addUser);

// router
//   .route('/:id')
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);



module.exports = router;

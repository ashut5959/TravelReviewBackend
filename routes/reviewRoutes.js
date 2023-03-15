const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const authController = require('../controllers/authController.js');
const reviewController = require('../controllers/reviewController.js');

router
  .route('/')
  .post(
    authController.protect,
    authController.ristrictTo('user'),
    reviewController.createReview
  );

router
    .route('/')
    .get(reviewController.getAllReviews);

module.exports = router;

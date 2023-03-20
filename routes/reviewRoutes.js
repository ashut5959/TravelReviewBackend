const express = require('express');
const userController = require('../controllers/userController.js');
const authController = require('../controllers/authController.js');
const reviewController = require('../controllers/reviewController.js');
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.ristrictTo('user'),
    reviewController.setTourUsersIds,
    reviewController.createReview
  );

router.route('/:id').delete(reviewController.deleteReview);
module.exports = router;

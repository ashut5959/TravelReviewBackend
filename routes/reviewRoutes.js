const express = require('express');
const userController = require('../controllers/userController.js');
const authController = require('../controllers/authController.js');
const reviewController = require('../controllers/reviewController.js');
const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.ristrictTo('user'),
    reviewController.setTourUsersIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.ristrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.ristrictTo('user', 'admin'),
    reviewController.deleteReview
  );
module.exports = router;
 
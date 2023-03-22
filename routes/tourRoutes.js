const express = require('express');
const tourController = require('../controllers/tourController.js');
const authController = require('../controllers/authController.js');
const reviewRouter = require('./reviewRoutes.js');
const router = express.Router();
router
  .route('/top-5-cheap')
  .get(tourController.topTours, tourController.getAllTours);

router.route('/get-stats').get(tourController.getTourStats);
router
  .route('/monthly-plans/:year')
  .get(
    authController.protect,
    authController.ristrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.ristrictTo('admin', 'lead-guide'),
    tourController.addTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.ristrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.ristrictTo('admin'),
    tourController.deleteTour
  );

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
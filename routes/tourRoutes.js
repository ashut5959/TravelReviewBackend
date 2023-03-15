const express = require('express');
const tourController = require('../controllers/tourController.js');
const authController = require('../controllers/authController.js');
// const reviewController = require('../controllers/reviewController.js');
const reviewRouter = require('./reviewRoutes.js');
const router = express.Router();
router
  .route('/top-5-cheap')
  .get(tourController.topTours, tourController.getAllTours);

router.route('/get-stats').get(tourController.getTourStats);
router.route('/monthly-plans/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.addTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.ristrictTo('admin'),
    tourController.deleteTour
  );

// router
// .route('/:tourId/reviews')
// .post(
//   authController.protect,
//   authController.ristrictTo('user'),
//   reviewController.createReview
// );

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;

// app.use(express.json());

// app.get("/", (req, res) => {
//   res
//     .status(200)
//     .json({ message: "My name is asutosh paul", app: "Natourous" });
// });

// app.post('/reaper', (req,res) => {
//     res.send("mello");
// })

// 3) ROUTES

// app.get('/api/v1/tours', getAllTours );
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', addTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

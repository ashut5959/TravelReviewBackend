const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const factory = require('./handlerFactory.js');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  // console.log(req.params.tourId)
  if (req.params.tourId) {
   filter = {tourRef: req.params.tourId}
  }
  console.log(filter);
  const reviews = await Review.find(filter);
  // console.log(Review.find(filter))
  res.status(200).json({
    status: 'Success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.setTourUsersIds = (req,res,next) => {
  if (!req.body.tourRef) req.body.tourRef = req.params.tourId;
  if (!req.body.userRef) req.body.userRef = req.user.id;
  next();
}

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

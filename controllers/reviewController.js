const Review = require('../models/reviewModel');
const factory = require('./handlerFactory.js');
// const AppError = require('../utils/appError.js');
// const User = require('../models/userModel');
// const catchAsync = require('../utils/catchAsync.js');

exports.setTourUsersIds = (req, res, next) => {
  if (!req.body.tourRef) req.body.tourRef = req.params.tourId;
  if (!req.body.userRef) req.body.userRef = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

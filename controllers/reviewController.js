const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');


exports.getAllReviews = catchAsync(async (req,res,next) => {
    const reviews  = await Review.find();

    res.status(200).json({
        status:'Success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.createReview = catchAsync(async (req,res,next) => {
    //nested route
    if(!req.body.tourRef) req.body.tourRef = req.params.tourId;
    if(!req.body.userRef) req.body.userRef = req.user.id
    const newReview = await Review.create(req.body);

    res.status(200).json({
        status:'Success',
        data: {
            newReview
        }
    })
})
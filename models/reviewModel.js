const mongoose = require('mongoose');
const Tour = require('./tourModel.js');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
      trim: true,
    },
    ratings: {
      type: Number,
      required: true,
      max: [5, 'Rating must be below 5 or equal'],
      min: [1, 'Ratings must be above 1.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tourRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must being to a tour'],
    },
    userRef: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must being to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'tourRef',
//     select: 'name',
//   }).populate({
//     path:'userRef',
//     select:'name photo'
//   });

this.populate({
    path:'userRef',
    select:'name photo'
  });
  next();
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

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
    path: 'userRef',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  console.log(tourId)
  const stats = await this.aggregate([
    {
      $match: { tourRef: tourId },
    },
    {
      $group: {
        _id: '$tourRef',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$ratings' },
      },
    },
  ]);
  console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRatings,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewSchema.post('save', function () {
  // this points to current review
  // let tourRef = this.tourRef.toString().replace(/new ObjectId\("(.*)"\)/, "$1");
  // console.log(this.tourRef)
  this.constructor.calcAverageRatings(this.tourRef);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne().clone();
  console.log(this.r);
  next();
})

reviewSchema.post(/^findOneAnd/, async function () {
  // this.r = await this.findOne(); does not work here as query has already been executed
    await this.r.constructor.calcAverageRatings(this.r.tourRef)
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

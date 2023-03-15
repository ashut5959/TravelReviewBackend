const Tour = require('../models/tourModel.js');
const APIFeatures = require('../utils/apiFeatures.js');
const catchAsync = require('../utils/catchAsync.js')
const AppError = require('../utils/appError.js')






exports.topTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-averageRating,price';
  req.query.fields = 'name,price,averageRating,summary,difficulty';
  next();
};



exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fields()
    .pagination();
  const tours = await features.query;

  
  // SEND REQUEST
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews')
    // Tor.findOne({_id: req.params.id})
    if(!tour) {
      return next(new AppError('No tour found with that ID',404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
});

exports.addTour = catchAsync(async (req, res, next) => {
  // const newTours = new Tour({});
  // newTours.save();

  const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        tour: newTour,
      },
    });

  // try {
    
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: error,
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if(!tour) {
    return next(new AppError('content not found for given ID',404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if(!tour) {
    return next(new AppError('content not found for given ID',404))
  }
    res.status(204).json({
      status: 'deleted',
      data: null,
    });
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      Stats: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
});

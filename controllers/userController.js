const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const factory = require('./handlerFactory.js');

filteredObj = (obj, ...filters) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (filters.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user posts paswword data
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppError('this route is not for password update.', 400));
  }
  const filteredBody = filteredObj(req.body, 'name', 'email');
  // 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'deleted',
    data: null,
  });
});

exports.getAllUser = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
};
exports.getUser = factory.getOne(User)
exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

// do not update password with this 
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

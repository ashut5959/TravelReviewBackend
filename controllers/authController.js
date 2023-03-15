const { promisify } = require('util');
const crypto = require('crypto');
const user = require('../models/userModel.js');
const catchAsync = require('../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError.js');
const User = require('../models/userModel.js');
const sendEmail = require('../utils/email.js');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};



const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  // remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await user.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Plese provide email and password', 400));
  }

  // 2) Check if user exists && password is correct

  const user = await User.findOne({ email }).select('+password');

  // console.log(await user.correctPassword(password, user.password))
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or Password is Incorrect', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);

  if (!token) {
    return next(
      new AppError('You are not logged in. Plese login to get accessed', 401)
    );
  }

  // 2) verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3) check if user still exits

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token doest not exist', 401)
    );
  }

  // 4) check if user chaged password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed the password', 401));
  }
  req.user = freshUser;
  next();
});

exports.ristrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with this address.', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and passwordCOnfirm to: ${resetURL}.\nIf you didn't forget your password, plese ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your passwprd token (valid for 10min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There wan an error sending the email. Try again Later!'),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user beased on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token has not expired, and there is user , ser the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedpasswordat property for the user

  // 4) log the user in, send jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Email or Password is Incorrect', 401));
  }
  // 3) If so, update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // User.findByIdAndUpdate will not work as intended
  // 4) log user in, send jwt
  createSendToken(user, 200, res);
});

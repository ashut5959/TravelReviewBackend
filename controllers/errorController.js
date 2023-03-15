const AppError = require("../utils/appError.js");


const handleCastError = (err) => {
  
  let message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

const handleDuplicateFieldDB = err => {
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // console.log(value);
  const value = err.keyValue.name;
  let message =  `Duplicate field value: x:\'${value}'\. Plese use another value`;
  return new AppError(message,400)
}

const handleValidationErrorDB = err => {
  // const errors = Object.values(err.errors.name)
  // console.log(errors)${errors.join('. ')}
  const message = `Invalid input data. `;
  return new AppError(message,400);
}

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

const handleJWTError = () =>  new AppError('Invalid Token. Plese log in again!',404);

const handleExpiredError = () => new AppError('Your token has expired. plese login again',401)

const sendErrorProd = (error, res) => {
  // Operational , trusted error: send message to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      // error: error,
      message: error.message,
    });
  } else {
    // send generic error message to the clients
    res.status(500).json({
      status: 'error',
      error: error,
      message: 'Something went wrong',
    });
  }
};
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);

  } else if (process.env.NODE_ENV === 'production') {
    
    
    let err = {...error}
    if(err.name === 'CasteError') err = handleCastError(err);
    if(err.code === 11000) {
      err = handleDuplicateFieldDB(err);
    }
    if(err.name === 'ValidatorError') err = handleValidationErrorDB(err);
    if(err.name === 'JsonWebTokenError') err = handleJWTError(err);
    if(err.name === 'TokenExpiredError') err = handleExpiredError();
    // console.log(err)
    // console.log(err.errors.name)
    sendErrorProd(err, res);
  }
};

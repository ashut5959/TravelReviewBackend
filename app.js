const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');
const tourRouters = require('./routes/tourRoutes.js');
const userRouters = require('./routes/userRoutes.js');
const reviewRouters = require('./routes/reviewRoutes.js');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// orders are maintained in express
// use is used to apply middleware stack
app.use(express.static(path.join(__dirname, 'public')));
// 1) MIDDLEWARES
// Set Security HTTP headers
app.use(helmet());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMITS REQUESTS FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, plese try again in an hour!',
});

app.use('/api', limiter);

// BODY PARSER, READING DATA FROM BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL
app.use(mongoSanitize());
// Data sanitization against xss
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration'],
  })
);
// serving static files
// app.use(express.static(`${__dirname}/public`));

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouters);
app.use('/api/v1/users', userRouters);
app.use('/api/v1/reviews', reviewRouters);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);

// 4) START THE SERVER
module.exports = app;

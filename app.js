const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false
  })
);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());

//1) GLOBAL MIDDLEWARES
//Implement cors
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100, // allow 100 request from the same ip
  windowMs: 60 * 60 * 1000, // allow in 1 hour
  message: 'Too many request from this IP, please try again in an hour!'
});

app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //express.json() как аргумент является middleware- это функции, имеющие доступ к объекту запроса (req), объекту ответа (res)
// middleware - єто функция которая  может модифицироватть,изменять входящие request данные
// Data sinitization against NoSQL query injection
// ex : /login мы напишем в req.body "email": {"gt": ""} -> always return true, и password: "pass14" мы сможем зайти не зная email пользователя
app.use(mongoSanitize()); //look at req.body, req.queryString,req.param and filter out all of the $ signs and dots
// Data sinitization against XSS
app.use(xss());

// Data poluttion
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // toISOString - convert it into a nice format; requestTime - current time of request
  // console.log(req.cookies);
  next();
});

//ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); // тепеерь не нужно вписывать полный путь. Мы как бы создаем мини app route.Кстати tourRouter - middleware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  //должен быть после всех путей!!.Примечание: если поставить его вначале,то мы всегда будем получать 404 not found
  next(new AppError(`Cant find the ${req.originalUrl} on this server!!`, 404));
});

app.use(globalErrorHandler);

//START SERVER
module.exports = app;

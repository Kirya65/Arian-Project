const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.setTourUserIds = catchAsync(async (req, res, next) => {
  //  Позволяем вложенные пути
  if (!req.body.tour) req.body.tour = req.params.tourId; // if we didn't secify tourId in the body, we specify it from the url
  if (!req.body.user) req.body.user = req.user.id; // we get user from the protect middleware
  next();
});
exports.getAllReviews = factory.getAll(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);

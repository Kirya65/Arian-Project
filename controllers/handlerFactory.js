const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id, req.body);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404)); // return нужен чтобы сразу закончить выполнение кода, а не переходить к res.status
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true //return the modified document rather then original
    });
    if (!doc) {
      return next(new AppError('No doc found with that ID', 404)); // return нужен чтобы сразу закончить выполнение кода, а не переходить к res.status
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newDoc
      }
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // const doc = await Model.findById(req.params.id).populate('reviews');
    // const tour = tours.find(el => el.id === id); // мы хотим найти обьект в котором id === req.params
    if (!doc) {
      return next(new AppError('No document found with that ID', 404)); // return нужен чтобы сразу закончить выполнение кода, а не переходить к res.status
    }
    res.status(200).json({
      status: 'succes',
      data: {
        doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //To allow for nested /GET reviews on tour(hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //EXECUTE THE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const docs = await features.query.explain() //check indexes;
    const docs = await features.query;
    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      result: docs.length,
      // requestAt: req.requestTime, //мы добавили это свойсвто в midlleware ИМЕННО ПОЄТОМУ req МОЖЕМ ЕГО ЮЗАТЬ
      data: {
        docs
      }
    });
  });

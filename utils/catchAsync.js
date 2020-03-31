const catchAsync = fn => {
  return (req, res, next) => {
    // анонимная функция
    fn(req, res, next).catch(err => next(err));
  };
  // Для того чтобы  избавится от try/catch структуры мы оборачиваем нашу async функцию в catchAsync
  // catchAsync функция должна возвращать другую функцию,которая будет привсвоена допустим к createTour
  // Анонимная функция вызывает fn(єта функция асинхронна).
  // fn возвращает promise. Если promise вернет ошибку мы можем словить ее.
  // catch функция передает ошибку в next функцию
  // Таким образом наша ошибка оказывается в Global ErrorHandling middleware
};
module.exports = catchAsync;

class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //  Мы вызываем родительский класс.Родительський класс - Error. Всяк ий раз, когда мы входим в него это будет message свойство
    //Таким обрзаом вызывая  super(message);  мы уже присваиваем message свойство
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;

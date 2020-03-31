const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image, pls upload only images.', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  console.log(req.file);
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
  // Проходимся в цикле по полям в obj
  // Для каждого поля проверяем один из allowedFields
  // Создаем новый обект с новым полем с идентичным именем с тем же значением с оригинального объекта
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1)Create error if user POST's password data
  if (req.body.password || req.passwordConfirm) {
    next(
      new AppError(
        'This route is not for password updates. Please use / updateMyPassword',
        400
      )
    );
  }
  // 2)Filtered out unwanted fields names thar are not allowed to be updated
  const filterdBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterdBody.photo = req.file.filename;
  // 3)Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filterdBody, {
    new: true, // return updated object not old one
    runValidators: true
  });

  res.status(200).json({
    status: 'succes',
    data: {
      updatedUser
    }
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'succes',
    data: null
  });
});
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//DO NOOT update Password with this!!!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

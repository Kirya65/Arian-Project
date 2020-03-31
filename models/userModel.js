const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name!!'],
    unique: true,
    trim: true,
    maxlength: [40, 'A user must have less or equal then 40 characters'],
    minlength: [4, 'A user must have at least 4 characters']
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  email: {
    type: String,
    required: [true, 'Provide an email adress!!!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Provide a password!!!'],
    minlength: [8, 'A password must have at least 8 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!!!'],
    validate: {
      // Thos only works on Create and Save!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  // Запускается эта функция если пароль был изменен
  if (!this.isModified('password')) return next();
  // Хэшируем пароль и стоимость вычисления
  this.password = await bcrypt.hash(this.password, 12);
  // Удаляем ненужное поле, поскольку нам нудно подтверждение лишь для валидации
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});
// eslint-disable-next-line prettier/prettier
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// eslint-disable-next-line prettier/prettier
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) { // JWTTimestamp - when jwt issued
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // ex: Jwt issued at time:100 but then we changed the password at time: 200. So it return true
  }
  return false; // it means that user doesn't changed the password after jwt issued;
};
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex'); // this token we will send to user to actually it is the ResetPassword
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;

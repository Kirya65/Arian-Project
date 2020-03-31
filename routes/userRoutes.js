const express = require('express');

const router = express.Router();

const userContoller = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); // PROTECT ALL THE ROUTS WICH COMES AFTER THAT LINE !! <- MIDDLEWARE

router.patch('/updatePassword', authController.updatePassword);

router.get('/me', userContoller.getMe, userContoller.getUser);

router.patch(
  '/updateMe',
  userContoller.uploadUserPhoto,
  userContoller.resizeUserPhoto,
  userContoller.updateMe
);
router.delete('/deleteMe', userContoller.deleteMe);
//!!
router.use(authController.restrictTo('admin'));

router.route('/').get(userContoller.getAllUsers);
router
  .route('/:id')
  .get(userContoller.getUser)
  .patch(userContoller.updateUser)
  .delete(userContoller.deleteUser);

module.exports = router;

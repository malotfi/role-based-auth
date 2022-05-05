const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const md = require('../middleware');

userRouter.post('/signup', md.validate('createUser'), userController.createUser);

userRouter.post('/login', userController.authenticateUser);

userRouter.get('/users', md.authenticateUser, md.authorizeUser('readAny', 'profile'), userController.indexUsers);

userRouter.get('/user/:userId', md.validate('getUser'), md.authenticateUser, md.authorizeUser('readOwn', 'profile'), userController.getUser);

userRouter.put('/user/:userId', md.validate('updateUser'), md.authenticateUser, md.authorizeUser('updateOwn', 'profile'), userController.updateUser);

userRouter.delete('/user/:userId', md.validate('deleteUser'), md.authenticateUser, md.authorizeUser('deleteOwn', 'profile'), userController.deleteUser);

module.exports = userRouter;

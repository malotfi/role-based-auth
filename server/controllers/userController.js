const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/userModel');

async function createUser (req, res) {
	try{
		const { email, password, role } = req.body;
		const hashedPassword = await bcrypt.hash(password.toString(), 10);
		const newUser = new User({ email, password: hashedPassword, role: role || 'basic' });
		const accessToken = jwt.sign({userId: newUser._id, userRole:
			newUser.role}, config.jwtSecret, {expiresIn: '1d'});
		newUser.accessToken = accessToken;
		await newUser.save();
		res.json({ id: newUser._id, email: newUser.email, role: newUser.role,
			accessToken: newUser.accessToken});
	} catch (err) {
		console.error(err);
	}
}

async function indexUsers (req, res) {
	try {
		const result = await User.find({});
		const users = result.map(user=>({ id: user._id, email:user.email, role: user.role }));
		res.json(users);
	} catch (err) {
		console.error(err);
	}
}

async function getUser (req, res) {
	try {
		const userId = req.params.userId;
		/*const user = mongoose.Types.ObjectId.isValid(userId)?
			await User.findById(userId):null;
		if (!user) {
			res.status(404);
			res.json('user not found');
			return;
		}*/
		const user = await User.findById(userId);
		res.json({ id: user._id, email: user.email, role: user.role });
	} catch (err) {
		console.error(err);
	}
}

async function updateUser (req, res) {
	try {
		const updatedUser = req.body;
		if (updatedUser.password) updatedUser.password = await
		bcrypt.hash(updatedUser.password.toString(), 10);
		const userId = req.params.userId;
		/*const user = mongoose.Types.ObjectId.isValid(userId)?
			await User.findByIdAndUpdate(userId, updatedUser):null;
		if (!user) {
			res.status(404);
			res.json('user not found');
			return;
		}*/
		const user = await User.findByIdAndUpdate(userId, updatedUser);
		res.json(`user ${user._id} was successfully updated`);
	} catch (err) {
		console.error(err);
	}
}

async function deleteUser (req, res) {
	try {
		const userId = req.params.userId;
		/*const user = mongoose.Types.ObjectId.isValid(userId)?
			await User.findByIdAndDelete(userId):null;
		if (!user) {
			res.status(404);
			res.json('user not found');
			return;
		}*/
		const user = await User.findByIdAndDelete(userId);
		res.json(`user ${user._id} was successfully deleted`);
	} catch (err) {
		console.error(err);
	}
}


async function authenticateUser (req, res) {
	try {
		const {email, password} = req.body;
		const user = await User.findOne({email});
		if (!user) {
			res.status(401);
			res.json('invalid email');
			return;
		}
		const hash = user.password;
		const valid = await bcrypt.compare(password.toString(), hash);
		if (!valid) {
			res.status(401);
			res.json('invalid password');
			return;
		}
		const accessToken = jwt.sign({userId: user._id, userRole: user.role},
			config.jwtSecret, {expiresIn: '1d'});
		await User.findByIdAndUpdate(user._id, { accessToken });
		res.json({ id: user._id, email: user.email, role: user.role,
			accessToken: accessToken});
	} catch (err) {
		console.error(err);
	}
}

module.exports = {
	createUser,
	indexUsers,
	getUser,
	updateUser,
	deleteUser,
	authenticateUser
};

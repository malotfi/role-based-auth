const jwt = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator');
const User = require('./models/userModel');
const { roles } = require('./roles');
const config = require('./config/config');

const filterObj = (obj, callback) => {
	return Object.fromEntries(Object.entries(obj).filter(callback));
};

const handleError = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		res.status(422);
		res.json({ errors: errors.array() });
		return;
	}
	next();
};


const validate = (method) => {
	switch (method) {
	case 'createUser': {
		return [
			body('email', 'Invalid email').exists().isEmail(),
			body('password').exists({checkFalsy: true}).isLength({min: 3, max: 30}),
			body('role').optional().isIn(['basic', 'supervisor', 'admin']),
			handleError
		];
	}
	case 'getUser': {
		return [
			param('userId', 'user not found')
				.isMongoId()
				.custom(async val => {
					const user = await User.exists({ _id: val });
					return user == null ?
						Promise.reject():Promise.resolve();
				})
				.withMessage('user not found'),
			handleError
		];
	}
	case 'updateUser': {
		return [
			param('userId', 'user not found')
				.isMongoId()
				.custom(async val => {
					const user = await User.exists({ _id: val });
					return user == null ?
						Promise.reject():Promise.resolve();
				})
				.withMessage('user not found'),
			body('email', 'Invalid email').exists().isEmail(),
			body('password').exists({checkFalsy: true}).isLength({min: 3, max: 30}),
			body('role').optional().isIn(['basic', 'supervisor', 'admin']),
			handleError
		];
	}
	case 'deleteUser': {
		return [
			param('userId', 'user not found')
				.isMongoId()
				.custom(async val => {
					const user = await User.exists({ _id: val });
					return user == null ?
						Promise.reject():Promise.resolve();
				})
				.withMessage('user not found'),
			handleError
		];
	}
	}
};

const authorizeUser = (action, resource) => {
	return async (req, res, next) => {
		try {

			const permission = roles.can(req.user.role)[action](resource);
			const attributes = permission.attributes
				.filter((attr)=>attr.charAt(0)=='!')
				.map((str)=>str.slice(1));

			if (!permission.granted) {
				res.status(401);
				res.json({error: 'permission denied: unable to perform this action'});
				return;
			}
			if(req.user.role == 'basic' && action.slice(-3) == 'Own'){
				if(!(req.user.id==req.params.userId)){
					res.status(401);
					res.json({error: 'permission deniend: unable to perform this action'});
					return;
				}
			}
			if (attributes) {
				if (action.slice(0,-3) == 'update') req.body = filterObj(req.body,
					arr=>!attributes.includes(arr[0]));
			}
			next();
		} catch (err) {
			console.error(err);
		}
	};
};

const authenticateUser = async (req, res, next) => {
	try {
		if (req.headers['x-access-token']) {
			const accessToken = req.headers['x-access-token'];
			const { userId, exp } = await jwt.verify(accessToken,
				config.jwtSecret, (err, decoded)=>{
					if (err){
						console.error(err);
						res.status(401);
						res.json({error: 'authentication failed'});
						return;
					}else return decoded;
				});
			// Check if token has expired
			if (exp < Date.now().valueOf() / 1000) { 
				res.status(401);
				res.json({
					error: 'JWT token has expired, please login to obtain a new one'
				});
				return;
			} 
			const user = await User.findById(userId);
			req.user = { id: user._id, email: user.email, role: user.role };
			next(); 
		} else { 
			res.status(401);
			res.json({
				error: 'You need to be logged in to access this route'
			});
			return;
		} 
	} catch (err) {
		console.error(err);
	}
};

module.exports = {
	validate,
	authorizeUser,
	authenticateUser
};

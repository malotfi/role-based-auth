const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema ({
	email:{
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	password:{
		type: String,
		required: true
	},
	role:{
		type: String,
		defalut: 'basic',
		enum: ['basic', 'supervisor', 'admin']
	},
	acessToken:{
		type: String
	}
});

const User = mongoose.model('user', UserSchema);

module.exports=	User;

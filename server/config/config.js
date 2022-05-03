const path = require('path');
require('dotenv').config({
	path: path.join(__dirname, '../../.env')
});

module.exports = {
	port: process.env.PORT,
	jwtSecret: process.env.JWT_SECRET
};

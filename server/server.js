const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/user.js');
const config = require('./config/config');

const app = express();

app.use(express.json());
app.use('/', userRouter);

const PORT = config.port || 3000;

mongoose
	.connect('mongodb://mongo:mongo100@localhost:27017/db_rbac_dev')
	.then(() => console.log('Connected to the Database successfully'))
	.catch((err)=>console.error(err));


app.listen(PORT, () => {
	console.log('Server is listening on Port:', PORT);
});

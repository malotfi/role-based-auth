db.createUser({
	user: 'mongo',
	pwd: 'mongo100',
	roles: [
		{
			role: 'readWrite',
			db: 'db_rbac_dev'
		}
	]
});
print('user created');

module.exports = function(app){

	//home route
	var home = require('../app/controllers/home');
	var teams = require('../app/controllers/teams');
	var users = require('../app/controllers/users');
	app.get('/', home.index);
	app.get('/teams', teams.index);


	//users
	app.get('/account', users.account);
	app.get('/user/:id', users.show)
	app.get('/register', users.registration);
	app.post('/register', users.register);
	app.get('/login', users.signin);
	app.post('/login', users.login);
	app.get('/logout', users.logout);
	app.post('/user/:id/delete', users.delete);
	app.get('/user/:id/edit', users.edit);
	app.post('/user/:id/edit', users.update);

};


//used to authenticate views
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

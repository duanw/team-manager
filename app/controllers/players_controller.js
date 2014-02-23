/*
 * Players controller
 *
 */
var mongoose = require('mongoose'),
  Player = mongoose.model('Player');

/*
 * Function for the players index page
 * sends all of the players to players/index.ejs
 */
exports.index = function(req, res) {
	Player.find(function(err, players) {
		res.render("players/index", {
			'players': players
		});
	});
}

/*
 * renders a page for a new player
 */
exports.new_category = function(req, res) {
	res.render("players/new");
}

/*
 * attemps to insert a new player
 */
exports.create_category = function(req, res) {
	// kind of placeholder for now, may change the name of the params
	// when writing 'new.ejs'
	var player = new Player({
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		date_of_birth: req.body.dob
	});
	player.save(function(err, created_object) {
		if(err) {
			res.render('players/new', {
				error: "Missing required fields"
			});
		}
		else {
			return res.redirect("/");
		}
	});
}

/*
 * Player show page
 */
exports.show = function(req, res) {
	// will make this do more when we get more added
	res.render('players/show');
}
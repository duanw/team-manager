/*
 * This is the email_template model, used for team email templates
 *
 */



// Synchronously load model dependecies, so foreign model calls can be made
var fs = require('fs');
var models_path = __dirname;
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

// mongoose and model stuff
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Team = mongoose.model('Team');

// define the schema
var Email_Template_Schema = new Schema({
  team_id: {type: ObjectId, required: true},
  subject: String,
  recipients: {type: Array, required: true},
  body: {type: String, required: true}
});

// gets all templates for a team
Email_Template_Schema.statics.getByTeamId = function(team_id, callback) {
	this.find({'team_id': team_id}, function(err, docs) {
		callback(err, docs)
	});
};

// and here is the model
mongoose.model('Email_Template', Email_Template_Schema);
module.exports = mongoose.model('Email_Template');
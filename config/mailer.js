// exports for mailer. This will be committed then added to .gitignore so you don't share your passwords on github
// http://www.nodemailer.com/ for more info

var mailer_options = {
	service: "Gmail",

	user: "team.manager.notification@gmail.com",
	pass: "$uper$ecret"

};

module.exports = mailer_options;

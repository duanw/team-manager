
// // Synchronously load model dependecies, so foreign model calls can be made
// var fs = require('fs');
// var models_path = __dirname.replace('tests','app/models')

// fs.readdirSync(models_path).forEach(function (file) {
//   if (~file.indexOf('.js')) require(models_path + '/' + file);
// })

var should = require('should');

process.env.NODE_ENV = 'test';

//needed to test server requests
var app = require("../app");
var request = require("supertest");
var agent = request.agent(app);


//var user_model = require('../app/models/user');
var mongoose = require('mongoose');
// var test_db = mongoose.connect('mongodb://localhost/team-manager-test'); //connection to the testing environment DB

var  User = mongoose.model('User');
var  Player = mongoose.model('Player');
var  Family = mongoose.model('Family');


//Do we need to test POST requests?
//
//



//mocha stuff
after(function(done){
	console.log("family test done");
	done();
});


//starting the testing

describe('Family', function(){	//context, so we can see where tests happen in console

    var ned;
    var homer;
    var marge;

	beforeEach(function(done){	//clears the database and creates testing objects
        
        //clear out dbs
        Player.remove();
        Family.remove();

        testUser = {
            first_name    : 'Ned',
            last_name    : 'Flanders',
            email    : 'flanders@gmail.com',
            password: "secret", 
            phone: "8089882688"
        };

        testPlayer = {
            first_name: 'Rod',
            last_name: 'Flanders',
            date_of_birth: '10/26/1992'
        };

        testFamily = {
            player_id: null,
            user_id: null
        };

        //creates all the users we need. put here to avoid non-unique email errors
        User.remove(function(){
            ned = new User(testUser);
            ned.save(function(err, ned_user){
                homer = new User({
                    first_name: "Homer",
                    last_name: "Simpson",
                    email: "homer@gmail.com",
                    password: "donuts",
                    phone: "8675309"
                });
                homer.save(function(err, ned_user){
                    marge = new User({
                        first_name: "Marge",
                        last_name: "Simpson",
                        email: "marge@gmail.com",
                        password: "blue",
                        phone: "4222222"
                    });
                    marge.save(done);
                });
            });
        });
    });

    after(function(done){
        //clear out db
        //User.remove(done);
        done();
    });



    //testing environment 

    describe('#save()', function(){
        var rod, todd, flanders1, flanders2;

        // you can use beforeEach in each nested describe
        beforeEach(function(done){

            //this generates the flanders kids
            rod = new Player(testPlayer);
            rod.save(function(err, user_rod){
                if(err){ console.log(err); return done(err);}
                flanders1 = new Family({
                    player_id: user_rod._id,
                    user_id: ned._id
                });

                flanders1.save(function(err, flan){
                    if(err){ console.log(err); return done(err);}
                    todd = new Player(testPlayer);
                    todd.first_name = "Todd";
                    todd.date_of_birth = "4/20/1999";
                    todd.save(function(err, user_todd){
                        if(err){ console.log(err); return done(err);}                            
                        flanders2 = new Family({
                            player_id: user_todd._id,
                            user_id: ned._id
                        });

                        flanders2.save(done);
                    });
                });
            });
        });

        //test for Family model
        it('should have required properties', function(done){

            flanders1.should.have.property('player_id', rod._id);
            flanders1.should.have.property('user_id', ned._id);
            flanders2.should.have.property('player_id', todd._id);
            flanders2.should.have.property('user_id', ned._id);
            done();
        });

        // validators
        it('player_id cannot be empty', function(done){
         flanders1.player_id = null;
            flanders1.validate(function(err, returned){
                err.should.be.ok;
                done();
            });
        });

        it('user_id cannot be empty', function(done){
         flanders1.user_id = null;
            flanders1.validate(function(err, returned){
                err.should.be.ok;
                done();
            });
        });


        //testing out the DB query methods

        describe('querying', function(){
            var bart, lisa, hb, hl, mb;

            // you can use beforeEach in each nested describe
            beforeEach(function(done){

                //this generates the flanders kids
                bart = new Player(testPlayer);
                bart.first_name = "Bart";
                bart.last_name = "Simpson";
                bart.date_of_birth = "6/09/1994";
                bart.save(function(err, user_bart){
                    if(err){ console.log(err); return done(err);}                            
                    hb = new Family({
                        player_id: user_bart._id,
                        user_id: homer._id
                    });

                    hb.save(function(err){
                        if(err){ console.log(err); return done(err);} 
                        mb = new Family({
                            player_id: user_bart._id,
                            user_id: marge._id
                        });

                        mb.save(function(err){
                            if(err){ console.log(err); return done(err);} 
                            lisa = new Player(testPlayer);
                            lisa.first_name = "Lisa";
                            lisa.last_name = "Simpson";
                            lisa.date_of_birth = "7/11/1996";

                            lisa.save(function(err, user_lisa){
                                if(err){ console.log(err); return done(err);} 
                                hl = new Family({
                                    player_id: user_lisa._id,
                                    user_id: homer._id
                                });

                                hl.save(done);
                            });
                        });
                    });
                });
            });//end of beforeEach
            
            it('method getByPlayerId', function(done){

                Family.getByPlayerId(todd._id, function(err, families){
                    families[0].should.have.property('player_id', todd._id);

                    Family.getByPlayerId(rod._id, function(err, families){
                        families[0].should.have.property('player_id', rod._id);

                        Family.getByPlayerId(lisa._id, function(err, families){
                            families[0].should.have.property('player_id', lisa._id);

                            Family.getByPlayerId(bart._id, function(err, families){
                                families[0].should.have.property('player_id', bart._id);
                                done();
                            });
                        });
                    });                    
                });
            });


            it('method getByUserId', function(done){
                //because of mongod's stupid objectID rules, where the same is not the same
                var nedid = ned._id;
                var homerid = homer._id;
                var margeid = marge._id;

                Family.getByUserId(ned._id, function(err, families){
                    families.should.have.length(2);
                    families[0].should.have.property('user_id', nedid);
                    families[1].should.have.property('user_id', nedid);

                    Family.getByUserId(homer._id, function(err, families){
                        families.should.have.length(2);
                        families[0].should.have.property('user_id', homerid);
                        families[1].should.have.property('user_id', homerid);

                        Family.getByUserId(marge._id, function(err, families){
                            families.should.have.length(1);
                            families[0].should.have.property('user_id', margeid);
                            families[0].should.have.property('player_id', bart._id);

                            done();
                        });
                    });
                });
            });

                


                describe('grabbing objects', function(){

                    it('method getUsersForPlayer', function(done){

                        Family.getUsersForPlayer(bart._id, function(users){
                            users.should.have.length(2);
                            users[0].should.have.property('last_name', 'Simpson');
                            users[1].should.have.property('last_name', 'Simpson');

                            Family.getUsersForPlayer(todd._id, function(users){
                                users.should.have.length(1);
                                users[0].should.have.property('first_name', 'Ned');

                                Family.getUsersForPlayer(todd._id, function(users){
                                    users.should.have.length(1);
                                    users[0].should.have.property('first_name', 'Ned');
                                    
                                    Family.getUsersForPlayer(lisa._id, function(users){
                                        users.should.have.length(1);
                                        users[0].should.have.property('first_name', 'Homer');

                                        done();
                                    });
                                });
                            }); 
                        });
                    });

                   it('method getPlayersForUser', function(done){

                        Family.getPlayersForUser(homer._id, function(players){
                            players.should.have.length(2);
                            players[0].should.have.property('last_name', 'Simpson');
                            players[1].should.have.property('last_name', 'Simpson');

                            Family.getPlayersForUser(ned._id, function(players){
                                players.should.have.length(2);
                                players[0].should.have.property('last_name', 'Flanders');
                                players[1].should.have.property('last_name', 'Flanders');

                                Family.getPlayersForUser(marge._id, function(players){
                                    players.should.have.length(1);
                                    players[0].should.have.property('first_name', 'Bart');
                                    players[0].should.have.property('last_name', 'Simpson');
                                    
                                    done();
                                });
                            }); 
                        });
                    });



                    it('method for USERS getPlayers', function(done){

                        ned.getPlayers(function(players){
                            players.should.have.length(2);
                            players[0].should.have.property('last_name', 'Flanders');
                            players[1].should.have.property('last_name', 'Flanders');
                            done();                     
                        })
                    });


                    it('method for PLAYERS getUsers', function(done){

                        lisa.getUsers(function(users){
                            users.should.have.length(1);
                            users[0].should.have.property('first_name', 'Homer');

                            bart.getUsers(function(users){
                                users.should.have.length(2);
                                users[0].should.have.property('last_name', 'Simpson');
                                users[1].should.have.property('last_name', 'Simpson');

                                done();
                            });
                        });
                    });


                });//grabbing


        });//querying

    
        describe("routes", function(done){
            var bart;
            
            beforeEach(function(done){

                //this generates the flanders kids
                bart = new Player(testPlayer);
                bart.first_name = "Bart";
                bart.last_name = "Simpson";
                bart.date_of_birth = "6/09/1994";
                bart.save(done);
            });

            it("post route new family", function(done){
                agent.post('/family/new')
                .field('user_id', ned._id)
                .field('player_id', bart._id)
                .end(function(err, res){
                    if(err) return done(err);
                    //res.should.have.property('text.user_id', ned._id);
                    done();
                });
            });

            it("post route delete family", function(done){
                nb = new Family({
                    player_id: bart._id,
                    user_id: ned._id
                });

                nb.save(function(err){
                    if(err){ console.log(err); return done(err);}
                        agent.post('/family/'+nb._id+'/delete')
                        .end(function(err, res){
                            if(err) return done(err);
                            //res.should.have.property('text.user_id', ned._id);
                            done();
                        });
                });
            });

        });//routes



    });//Family



});
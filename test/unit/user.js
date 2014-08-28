/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../app/models/user'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'facebook-test';

describe('User', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      console.log(stdout, stderr);
      done();
    });
  });

  describe('constructor', function(){
    it('should create a new User object', function(){
      var u = new User();
      expect(u).to.be.instanceof(User);
    });
  });
  describe('.update', function(){
    it('should update and save a user', function(done){
      var body = {
        email    : 'bob@email.com',
        photo    : 'url.com/image.jpeg',
        tagline  : 'i\'m awesome',
        facebook : 'facebook.com/bob',
        twitter  : '@bob',
        phone    : '615-555-5555',
        visible  : 'public'
      };
      User.findById('000000000000000000000001', function(err, user){
        User.update(body, user, function(){
          User.findById('000000000000000000000001', function(err, user){
            expect(user.email).to.equal('bob@email.com');
            expect(user.facebook).to.equal('facebook.com/bob');
            expect(user.twitter).to.equal('@bob');
            expect(user.phone).to.equal('615-555-5555');
            expect(user.isVisible).to.equal(true);
            done();
          });
        });
      });
    });
  });
  describe('.all', function(){
    it('should return all users', function(done){
      User.all(function(err, users){
        expect(users).to.have.length(3);
        done();
      });
    });
  });
  describe('.find', function(){
    it('should find by query', function(done){
      User.find({isVisible:true}, function(err, users){
        expect(users).to.have.length(2);
        done();
      });
    });
  });
  describe('#send', function(){
    it('should send a text message to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){
        User.findById('000000000000000000000002', function(err, receiver){
          sender.send(receiver, {mtype:'text', message:'HELLO FROM YOUR LOYAL UNIT  TEST'}, function(err, response){
            //console.log(err);
            //console.log(response);
            expect(response.sid).to.be.ok;
            done();
          });
        });
      });
    });
    it('should send an email to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){
        User.findById('000000000000000000000002', function(err, receiver){
          sender.send(receiver, {mtype:'email', message:'THIS IS AN EMAIL'}, function(err, response){
            //console.log(err);
            expect(response.id).to.be.ok;
            done();
          });
        });
      });
    });
    it('should send an internal message to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){
        User.findById('000000000000000000000002', function(err, receiver){
          sender.send(receiver, {mtype:'internal', message:'THIS IS AN internal'}, function(err, response){
            User.findById('000000000000000000000002', function(err, receiver){
              expect(receiver.messages).to.have.length(1);
              done();
            });
          });
        });
      });
    });
  });
});


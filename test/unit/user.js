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
});


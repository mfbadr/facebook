/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'facebook-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../app/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    console.log(env);
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=bob@aol.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /profile/edit', function(){
    it('should show the edit profile page', function(done){
      request(app)
      .get('/profile/edit')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        expect(res.text).to.include('Public');
        done();
      });
    });
  });
  describe('put /profile', function(){
    it('should update the profile ', function(done){
      request(app)
      .post('/profile')
      .send('_method=put&email=bob%40email.com&photo=url.com%2Fimage.jpeg&tagline=i%27m+awesome&facebook=facebook.com%2Fbob&twitter=%40bob&phone=615-555-5555&visible=public')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile'); //where are we redirecting to?
        done();
      });
    });
  });
  describe('get /profile', function(){
    it('should show the profile', function(done){
      request(app)
      .get('/profile')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        expect(res.text).to.include('Phone');
        done();
      });
    });
  });
  describe('get /users', function(){
    it('should show all public profile', function(done){
      request(app)
      .get('/users')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob');
        expect(res.text).to.include('bill');
        expect(res.text).to.not.include('sue');
        done();
      });
    });
  });
  describe('get /users/:email', function(){
    it('should show another users public profile', function(done){
      request(app)
      .get('/users/bill@aol.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bill');
        done();
      });
    });
    it('should not show another users private profile', function(done){
      request(app)
      .get('/users/sue@aol.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users');
        done();
      });
    });
  });
  describe('post /message/:id', function(){
    it('should send a user a text', function(done){
      request(app)
      .post('/message/000000000000000000000003')
      .set('cookie', cookie)
      .send('mtype=text&message=hello from your acceptance test')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/bill@aol.com');
        done();
      });
    });
    it('should send a user a email', function(done){
      request(app)
      .post('/message/000000000000000000000003')
      .set('cookie', cookie)
      .send('mtype=email&message=hello from your acceptance test')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/bill@aol.com');
        done();
      });
    });
  });
});


'use strict';

var User    = require('../models/user'),
    Message = require('../models/message'),
    moment  = require('moment');

exports.new = function(req, res){
  res.render('users/new');
};

exports.login = function(req, res){
  res.render('users/login');
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};

exports.create = function(req, res){
  User.register(req.body, function(err, user){
    if(user){
      res.redirect('/');
    }else{
      res.redirect('/register');
    }
  });
};

exports.authenticate = function(req, res){
  User.authenticate(req.body, function(user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id;
        req.session.save(function(){
          res.redirect('/');
        });
      });
    }else{
      res.redirect('/login');
    }
  });
};
//need undread count from here on out
exports.edit = function(req, res){
  Message.collection.count({to:res.locals.user._id, isRead:false}, function(err, count){
    res.render('users/edit', {count:count});
  });
};

exports.update = function(req, res){
  User.update(req.body, res.locals.user, function(){
    res.redirect('/profile');
  });
};

exports.show = function(req, res){
  Message.collection.count({to:res.locals.user._id, isRead:false}, function(err, count){
    res.render('users/profile', {count:count});
  });
};

exports.index = function(req, res){
  User.find({isVisible:true}, function(err, users){
    Message.collection.count({to:res.locals.user._id, isRead:false}, function(err, count){
      res.render('users/index', {users:users, count:count});
    });
  });
};

exports.viewUser = function(req, res){
  User.find({email:req.params.email}, function(err, person){
    if(person[0].isVisible){
      Message.collection.count({to:res.locals.user._id, isRead:false}, function(err, count){
        res.render('users/viewUser', {person:person[0], count:count});
      });
    }else{
      res.redirect('/users');
    }
  });
};

exports.message = function(req, res){
  User.findById(req.params.userId, function(err, receiver){
    res.locals.user.send(receiver, req.body, function(){
      res.redirect('/users/' + receiver.email);
    });
  });
};

exports.inbox = function(req, res){
  Message.collection.find({to:res.locals.user._id}).toArray(function(err, messages){
    Message.collection.count({to:res.locals.user._id, isRead:false}, function(err, count){
      res.render('users/inbox', {messages:messages, moment:moment, count:count});
    });
  });
};

exports.showMessage = function(req, res){
  Message.findById(req.params.id, function(err, message){
    //console.log(message);
    Message.collection.count({to:res.locals.user._id, isRead:false}, function(err, count){
      res.render('users/viewMessage',{message:message, moment:moment, count:count});
    });
  });
};

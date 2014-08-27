'use strict';

var bcrypt = require('bcrypt'),
    Mongo  = require('mongodb');

function User(){
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});

User.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, cb);
};

User.register = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(user){return cb();}
    o.password = bcrypt.hashSync(o.password, 10);
    User.collection.save(o, cb);
  });
};

User.authenticate = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(!user){return cb();}
    var isOk = bcrypt.compareSync(o.password, user.password);
    if(!isOk){return cb();}
    cb(user);
  });
};

User.update = function(body, user, cb){
  user.email = body.email;
  user.photo = body.photo;
  user.tagline = body.tagline;
  user.facebook = body.facebook;
  user.twitter = body.twitter;
  user.phone = body.phone;
  user.isVisible = body.visible === 'public';
  //user.visible = body.visible;
  User.collection.save(user, cb);
};

module.exports = User;


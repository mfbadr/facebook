'use strict';

var bcrypt = require('bcrypt'),
    _      = require('lodash'),
    Message = require('./message'),
    Mongo  = require('mongodb');

function User(){
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});
User.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, function(err, obj){
    cb(err, _.create(User.prototype, obj));
  });
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

User.all = function(cb){
  User.collection.find().toArray(cb);
};

User.find = function(query, cb){
  User.collection.find(query).toArray(cb);
};

User.prototype.send = function(receiver, obj, cb){
  switch(obj.mtype){
    case 'text':
      sendText(receiver.phone, obj.message, cb);
      break;
    case 'email':
      var data = {
        from: this.email,
        to: receiver.email,
        subject: 'Message from ' + this.email,
        text: obj.message
      };
      sendEmail(data, cb);
      break;
    case 'internal':
      var internalData = {
        from: this.email,
        to: receiver._id,
        body: obj.message
      };
      sendInternal(internalData, cb);
      break;
  }

};
module.exports = User;

function sendInternal(data, cb){
  var message = new Message(data);
  Message.collection.save(message, cb);
}

function sendEmail(data, cb){
  var Mailgun = require('mailgun-js'),
      domain  = process.env.MGDOMAIN,
      apiKey  = process.env.MGKEY,
      mailgun = new Mailgun({apiKey: apiKey, domain: domain});
  mailgun.messages().send(data, cb);
}

function sendText(to, body, cb){
// Twilio Credentials
  if(!to){return cb();}
  var accountSid = process.env.TWSID,
      authToken  = process.env.TWTOK,
      from       = process.env.FROM,
      client     = require('twilio')(accountSid, authToken);


//require the Twilio module and create a REST client

  client.messages.create({
    to: to,
    from: from,
    body: body
  },cb);
}

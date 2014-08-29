'use strict';

var _      = require('lodash'),
    Mongo  = require('mongodb');

function Message(data){
  this.from = data.from; //email
  this.to = data.to; //oid
  this.date = new Date();
  this.body = data.body;
  this.isRead = false;
}

Object.defineProperty(Message, 'collection', {
  get: function(){return global.mongodb.collection('messages');}
});


Message.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Message.collection.update({_id:_id}, {$set : {isRead:true}}, function(){
    Message.collection.findOne({_id:_id}, function(err, obj){
      cb(err, _.create(Message.prototype, obj));
    });
  });
};

Message.all = function(cb){
  Message.collection.find().toArray(cb);
};

Message.find = function(query, cb){
  Message.collection.find(query).toArray(cb);
};

module.exports = Message;


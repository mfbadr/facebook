'use strict';

var Message = require('../models/message');

exports.index = function(req, res){
  Message.collection.count({to:res.locals.user._id, isRead:false}, function(err, count){
    res.render('home/index', {count:count});
  });
};


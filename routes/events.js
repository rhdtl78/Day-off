const express = require('express');
const Event = require('../models/event');
const Comment = require('../models/comment');
const ReadLog = require('../models/read-log');
const User = require('../models/user');
const catchErrors = require('../lib/async-error');
const needAuth = require('../lib/needAuthentication.js');
const eventsJson = require('../lib/getEventsJSON');
const ParticipateLog = require('../models/participate-log');
module.exports = io => {
  const router = express.Router();
  /* GET events listing. */
  router.get('/', catchErrors((req, res, next) => eventsJson(req,res,next,'events/index')));

  router.get('/new', needAuth, (req, res, next) => {
    res.render('events/new', {event: {}});
  });

  router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    res.render('events/edit', {event: event});
  }));

  router.get('/:id',needAuth, catchErrors(async (req, res, next) => {
    const event = await Event.findById(req.params.id).populate('author');
    const comments = await Comment.find({event: event.id}).populate('author');

    var readLog = await ReadLog.findOne({author: req.user._id, event: event._id});
    console.log(readLog);
    var new_readLog;
    if (!readLog) {

      await ReadLog.create({author: req.user._id, event: event._id});
      new_readLog = await ReadLog.findOne({author: req.user._id, event: event._id});
      console.log(new_readLog.author);
      event.readLog.push(new_readLog._id);
      await event.save();
    }else{
      console.log(readLog.author);
      console.log('no read log')
    }
    event.numReads = event.readLog.length,
    console.log(req.user.id);

    var logs = event.participateLog;
    var length = event.numParticipant;
    var participants = [];
    var isParticipated = false;
    var i = 0;
    for(i = 0 ; i < length; i++){
      var log = await ParticipateLog.findById(logs[i]);
      if(log){
        console.log(log);
        var p = await User.findById(log.author);
        if(p){
          participants[i] = {_id:p.id,name:p.name,email:p.email,participatedAt:log.createdAt};
          if(p.id == req.user.id){
            isParticipated = true;
          }
        }
      }
    }
    console.log(req.user.name,' was participants? ',isParticipated);
    await event.save();
    res.render('events/show', {event: event, comments: comments, isParticipated: isParticipated});
  }));

  router.get('/:id/participants',needAuth, catchErrors(async (req,res,next)=>{
    const event = await Event.findById(req.params.id).populate('author');
    var logs = event.participateLog;
    var length = event.numParticipant;
    var participants = [];
    var i = 0;
    for(i = 0 ; i < length; i++){
      var log = await ParticipateLog.findById(logs[i]);
      if(log){
        console.log(log);
        var p = await User.findById(log.author);
        if(p){
          console.log(p);
          participants[i] = {id:p.id,name:p.name,email:p.email,participatedAt:log.createdAt};
        }
      }
    }
    res.render('events/participants',{participants:participants, post:event});
  }));

  router.get('/comment/:id/edit',needAuth, catchErrors(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    res.render('events/comment_edit', {comment: comment});
  }));


  router.get('/byuser/:id', needAuth, catchErrors(async (req, res, next) => {
    const events = await Event.find({author:req.params.id}).populate('author');
    console.log(req.params._id);
    if(events) console.log(events);

    res.render('events/index', {events:events, author:req.params.id});
  }));

  router.post('/comment/:id',needAuth, catchErrors(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    const event = await Event.findById(comment.event);

    if (!comment) {
      req.flash('danger', 'Not exist comment');
      return res.redirect('back');
    }
    comment.content = req.body.content

    await comment.save();
    req.flash('success', 'Successfully updated');
    res.redirect(`/events/${event.id}`);
  }));

  router.post('/:id',needAuth, catchErrors(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
      req.flash('danger', 'Not exist event');
      return res.redirect('back');
    }
    var s_arr = req.body.startOn.split('-');
    var e_arr = req.body.endOn.split('-');
    event.title = req.body.title;
    event.content = req.body.content;
    event.location = req.body.location;
    event.startOn = new Date(parseInt(s_arr[0]), parseInt(s_arr[1])-1,parseInt(s_arr[2]));
    event.endOn = new Date(parseInt(e_arr[0]),parseInt(e_arr[1])-1,parseInt(e_arr[2]));
    event.partyName = req.body.partyName;
    event.partyDescription = req.body.partyDescription;
    event.fee = req.body.fee;
    event.category = req.body.category;
    event.tags = req.body.tags.split(" ").map(e => e.trim());

    await event.save();
    req.flash('success', 'Successfully updated');
    res.redirect('/events');
  }));

  router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
    await Event.findOneAndRemove({_id: req.params.id});
    req.flash('success', 'Successfully deleted');
    res.redirect('/events');
  }));

  router.delete('/comment/:id', needAuth, catchErrors(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    console.log(comment);
    var event = await Event.findById(comment.event);
    event.numComments--;
    await Comment.findOneAndRemove({_id: req.params.id});
    await event.save();
    req.flash('success', 'Successfully deleted');
    res.redirect(`/events/${event.id}`);
  }));

  router.post('/', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    var event = new Event({
      title: req.body.title,
      author: user._id,
      content: req.body.content,
      location: req.body.location,
      startOn: req.body.startOn,
      endOn: req.body.endOn,
      partyName: req.body.partyName,
      partyDescription: req.body.partyDescription,
      fee: req.body.fee,
      category: req.body.category,
      tags: req.body.tags.split(" ").map(e => e.trim()),
    });
    await event.save();
    req.flash('success', 'Successfully posted');
    res.redirect('/events');
  }));

  router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const event = await Event.findById(req.params.id);

    if (!event) {
      req.flash('danger', 'Not exist event');
      return res.redirect('back');
    }

    var comment = new Comment({
      author: user._id,
      event: event._id,
      content: req.body.content
    });
    await comment.save();
    event.numComments++;
    await event.save();

    const url = `/events/${event._id}#${comment._id}`;
    io.to(event.author.toString())
      .emit('commented', {url: url, event: event});
    console.log('SOCKET EMIT', event.author.toString(), 'commented', {url: url, event: event})
    req.flash('success', 'Successfully commented');
    res.redirect(`/events/${req.params.id}`);
  }));

  return router;
}

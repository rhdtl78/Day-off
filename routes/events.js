const express = require('express');
const Event = require('../models/event');
const Answer = require('../models/answer');
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

  router.get('/:id', catchErrors(async (req, res, next) => {
    const event = await Event.findById(req.params.id).populate('author');
    const answers = await Answer.find({event: event.id}).populate('author');
    event.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
    await event.save();
    res.render('events/show', {event: event, answers: answers});
  }));

  router.get('/:id/participants', catchErrors(async (req,res,next)=>{
    const event = await Event.findById(req.params.id).populate('author');
    var logs = event.participateLog;
    var length = event.numParticipant;
    var party = [];
    var i = 0;
    for(i = 0 ; i < length; i++){
      var log = await ParticipateLog.findById(logs[i]);
      var p = await User.findById(log.author);
      party[i] = {name:p.name,email:p.email,participatedAt:log.createdAt};
    }
    res.render('events/participants',{participants:party, post:event});
  }));

  router.post('/:id', catchErrors(async (req, res, next) => {
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
    event.partyDescription = req.partyDescription;
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

  router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
    const user = req.user;
    const event = await Event.findById(req.params.id);

    if (!event) {
      req.flash('danger', 'Not exist event');
      return res.redirect('back');
    }

    var answer = new Answer({
      author: user._id,
      event: event._id,
      content: req.body.content
    });
    await answer.save();
    event.numAnswers++;
    await event.save();

    const url = `/events/${event._id}#${answer._id}`;
    io.to(event.author.toString())
      .emit('answered', {url: url, event: event});
    console.log('SOCKET EMIT', event.author.toString(), 'answered', {url: url, event: event})
    req.flash('success', 'Successfully answered');
    res.redirect(`/events/${req.params.id}`);
  }));

  return router;
}

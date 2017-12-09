const express = require('express');
const Event = require('../../models/event');
const Comment = require('../../models/comment');
const ParticipateLog = require('../../models/participate-log');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({
      status: 401,
      msg: 'Unauthorized'
    });
  }
}));

router.use('/events', require('./events'));

// Participate for Event
router.post('/events/:id/participate', catchErrors(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next({
      status: 404,
      msg: 'Not exist question'
    });
  }
  var log = await ParticipateLog.findOne({author: req.user._id, event: event._id});
  var new_log;
  if (!log) {
    await ParticipateLog.create({author: req.user._id, event: event._id});
    new_log = await ParticipateLog.findOne({author: req.user._id, event: event._id});
    event.participateLog.push(new_log._id);
    event.numParticipant = event.participateLog.length,
    await event.save();
  }
  return res.json(event);
}));

// Like for Comment
router.post('/comments/:id/participate', catchErrors(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  comment.numParticipant++;
  await comment.save();
  return res.json(comment);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});

module.exports = router;

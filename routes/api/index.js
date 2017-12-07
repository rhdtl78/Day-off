const express = require('express');
const Event = require('../../models/event');
const Answer = require('../../models/answer');
const ParticipateLog = require('../../models/participate-log');
const catchErrors = require('../../lib/async-error');

const router = express.Router();

router.use(catchErrors(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next({status: 401, msg: 'Unauthorized'});
  }
}));

router.use('/events', require('./events'));

// Participate for Event
router.post('/events/:id/participate', catchErrors(async (req, res, next) => {
  console.log('particepate in')
  const event = await Event.findById(req.params.id);
  console.log('get event', event);
  if (!event) {
    console.log('event not exist');
    return next({status: 404, msg: 'Not exist event'});
  }
  event.numParticipant++;
  console.log('increase numParticipant');
  var log = new ParticipateLog({author: req.user, event: event});
  await Promise.all([
    event.participateLog.push(log),
    console.log('push log to event', log),
    event.save()
  ]);
  return res.json(event);
}));

// Like for Answer
router.post('/answers/:id/participate', catchErrors(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);
  answer.numParticipant++;
  await answer.save();
  return res.json(answer);
}));

router.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status,
    msg: err.msg || err
  });
});

module.exports = router;

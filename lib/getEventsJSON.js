const Event = require('../models/event');

module.exports = async function getEventsJson(req, res, next, callbackUrl) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {
      $or: [
        {title: {'$regex': term, '$options': 'i'}},
        {content: {'$regex': term, '$options': 'i'}},
        {location: {'$regex': term, '$options': 'i'}},
        {startOn: {'$regex': term, '$options': 'i'}},
        {endOn: {'$regex': term, '$options': 'i'}},
        {partyName: {'$regex': term, '$options': 'i'}},
        {partyDescription: {'$regex': term, '$options': 'i'}},
        {fee: {'$regex': term, '$options': 'i'}},
        {category: {'$regex': term, '$options': 'i'}},
      ]
    };
  }
  const events = await Event.paginate(query, {
    sort: {
      createdAt: -1
    },
    populate: 'author',
    page: page,
    limit: limit
  });

  res.render(callbackUrl, {events: events, term: term, query: req.query});
};

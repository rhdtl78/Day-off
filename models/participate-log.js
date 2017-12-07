const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: {}, ref: 'User' },
  event: { type: {}, ref: 'Event' },
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var ParticipateLog = mongoose.model('ParticipateLog', schema);

module.exports = ParticipateLog;

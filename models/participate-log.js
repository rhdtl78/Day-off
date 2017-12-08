const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User', default : null},
  event: { type: Schema.Types.ObjectId, ref: 'Event' , default: null},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var ParticipateLog = mongoose.model('ParticipateLog', schema);

module.exports = ParticipateLog;

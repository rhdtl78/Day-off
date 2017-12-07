const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  tags: [String],
  numParticipant: {type: Number, default: 0},
  participateLog: {type: [{}], ref:'ParticipateLog'},
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
  location: {type: String, trim: true, },
  startOn: {type: Date},
  endOn: {type: Date},
  partyName: {type: String, trim: true, },
  partyDescription: {type: String, trim: true, },
  fee: {type: Number, deafault: 0},
  category: {type: String, default: "기타"},
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Event = mongoose.model('Event', schema);

module.exports = Event;

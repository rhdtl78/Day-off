const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  tags: [String],
  numLikes: {type: Number, default: 0},
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now},
  location: {type: String, trim: true, },
  startOn: {type: Date, required: true},
  endOn: {type: Date, required: true},
  partyName: {type: String, trim: true, required: true},
  partyDescription: {type: String, trim: true, required: true},
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Event = mongoose.model('Event', schema);

module.exports = Event;

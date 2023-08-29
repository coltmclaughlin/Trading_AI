const mongoose = require('mongoose');
const moment = require('moment-timezone');

const ActivitySchema = new mongoose.Schema({
  name_id: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  agree: {
    type: Array,
    default: []
  },
  disagree: {
    type: Array,
    default: []
  },
  assets: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    required: true
  },
  entry: {
    type: Number,
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  stop: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    trim: true
  },
  createdTime: {
    type: Date,
    default: () => moment().tz('America/New_York').toDate()
  },
  endedTime: String,
  result: String
});



const Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;

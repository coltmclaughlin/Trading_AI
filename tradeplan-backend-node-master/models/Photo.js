const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  filename: {
    type: String,
    maxlength: 200
  },
  uploadDate: {
    type: Date,
    default: Date.now()
  },
  userID: {
    type: String,
    required: true
  }
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;

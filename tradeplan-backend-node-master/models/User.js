const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  googleId: String,
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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: String,
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: String,
  country: String
});



const User = mongoose.model('User', UserSchema);

module.exports = User;

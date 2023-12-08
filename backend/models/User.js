const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  company_id: {
    type: String,
    required: false
  },
  hashedPassword: {
    type: String,
    required: true
  },
  profileImageUrl: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('User', userSchema);
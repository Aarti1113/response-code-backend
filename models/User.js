const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },  // This field stores the hashed password
});

const User = mongoose.model('User', userSchema);
module.exports = User;

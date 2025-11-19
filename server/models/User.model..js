const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String },

  password: { type: String },      // optional (Google users don't need it)

  googleId: { type: String },      // Google-only
  picture: { type: String },       // Google-only

}, { timestamps: true });


// Hash password only if present
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password only for normal login
userSchema.methods.comparePassword = function (entered) {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);

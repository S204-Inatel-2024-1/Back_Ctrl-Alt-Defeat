// Model Orientador

const mongoose = require("mongoose");

const Professor = mongoose.model("Professor", {
  name: String,
  email: String,
  acesso: String,
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

module.exports = Professor;

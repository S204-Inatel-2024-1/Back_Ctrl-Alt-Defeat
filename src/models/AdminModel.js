// Model Adiminstrador

const mongoose = require("mongoose");

const Admin = mongoose.model("Admin", {
  email: String,
  acesso: String,
  password: String,
});

module.exports = Admin;

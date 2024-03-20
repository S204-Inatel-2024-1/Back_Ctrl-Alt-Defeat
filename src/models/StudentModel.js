// Model Aluno

const mongoose = require("mongoose");

const Student = mongoose.model("Student", {
  name: String,
  email: String,
  matricula: String,
  acesso: String,
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

module.exports = Student;

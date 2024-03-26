// Model Equipe
const mongoose = require("mongoose");

const Team = mongoose.model("Team", {
  number: String,
  name: String,
  members: [], // Array de objetos
  nameProfessor: String,
  emailProfessor: String,
  status: String,
});

module.exports = Team;

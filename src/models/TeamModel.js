// Model Equipe
const mongoose = require("mongoose");

const Team = mongoose.model("Team", {
  nameProjeto: String,
  members: [], // Array de objetos
});

module.exports = Team;

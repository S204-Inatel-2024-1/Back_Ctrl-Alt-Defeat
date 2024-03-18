// Imports
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const orientadorController = require("./controllers/orientadorController");
const alunoController = require("./controllers/alunoController");
const adminController = require("./controllers/adminController");
const userController = require("./controllers/userIDsController");
const {
  checkTokenOrientador,
  checkTokenAdmin,
} = require("./middlewares/authMiddleware");

// Config Express Json Response
app.use(express.json());

// Open Route - Public Route
app.get("/public/route", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a API da Fetin!" });
});

// Private Routes - Necessário tokens para acesso
app.get(
  "/user/orientador/get/:id",
  checkTokenOrientador,
  userController.orientadorGetUserID
);
app.get("/user/admin/get/:id", checkTokenAdmin, userController.adminGetUserID);

// Registers and Logins
app.post("/auth/register/aluno", alunoController.registerAluno);
app.post("/auth/login/aluno", alunoController.loginAluno);
app.post("/auth/register/orientador", orientadorController.registerOrientador);
app.post("/auth/login/orientador", orientadorController.loginOrientador);
app.post("/auth/register/admin", adminController.registerAdmin);
app.post("/auth/login/admin", adminController.loginAdmin);

// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

// Database connection
mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@testcluster.cs0xsah.mongodb.net/`
  )
  .then(() => {
    app.listen(3000);
    console.log("Realizada Conexão com MongoDB Atlas!");
  })
  .catch((err) => console.log(err));
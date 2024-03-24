const Admin = require("../models/AdminModel");
const Aluno = require("../models/StudentModel");
const Orientador = require("../models/ProfessorModel");
const Equipe = require("../models/TeamModel");
const bcrypt = require("bcrypt");

function validateFields(fields) {
  for (const field of fields) {
    if (!field.key) {
      return field.message;
    }
  }

  return null;
}

function validatePasswords(password, confirmPass) {
  if (password !== confirmPass) {
    return "As senhas não conferem!";
  }

  return null;
}

async function comparePasswords(password, userPassword) {
  // Check if passwords match
  const checkPass = await bcrypt.compare(password, userPassword);

  if (!checkPass) {
    return "Senha inválida!";
    // return res.status(422).json({ msg: "Senha inválida!" });
  }
}

async function createHash(password) {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  return passwordHash;
}

async function validateAdmins(email, checkLogin = false) {
  const userExists = await Admin.findOne({ email });

  if (userExists) {
    return checkLogin ? null : "Email já cadastrado. Utilize outro!";
  } else if (!userExists) {
    return checkLogin ? "Administrador não encontrado no Banco de Dados" : null;
  }
}

async function validateAlunos(email, checkLogin = false) {
  const userExists = await Aluno.findOne({ email });

  if (userExists) {
    return checkLogin ? null : "Email já cadastrado. Utilize outro!";
  } else if (!userExists) {
    return checkLogin ? "Aluno não encontrado no Banco de Dados" : null;
  }
}

async function validateOrientadores(email, checkLogin = false) {
  const userExists = await Orientador.findOne({ email });

  if (userExists) {
    return checkLogin ? null : "Email já cadastrado. Utilize outro!";
  } else if (!userExists) {
    return checkLogin ? "Orientador não encontrado no Banco de Dados" : null;
  }
}

async function validateEquipe(nameProjeto) {
  const teamExists = await Equipe.findOne({ nameProjeto });

  if (teamExists) {
    return `${teamExists.nameProjeto} já existente. Por favor crie outro!`;
  } else {
    return null;
  }
}

async function validateEmailMat(email, matricula) {
  const userExists = await Aluno.findOne({ email });

  if (!userExists) {
    return `Email ${email} não cadastrado no Banco de Dados!`;
  } else if (matricula !== userExists.matricula) {
    return `Matrícula de ${email} incorreta de acordo com o Banco de Dados!`;
  } else {
    return null;
  }
}

module.exports = {
  validateFields,
  validatePasswords,
  comparePasswords,
  createHash,
  validateAdmins,
  validateAlunos,
  validateOrientadores,
  validateEquipe,
  validateEmailMat,
};

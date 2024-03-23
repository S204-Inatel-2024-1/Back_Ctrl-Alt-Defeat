const Aluno = require("../models/StudentModel");

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

async function validateAdmins(email, checkLogin = false) {}

async function validateAlunos(email, checkLogin = false) {
  const userExists = await Aluno.findOne({ email });

  if (userExists) {
    return checkLogin ? null : "Email já cadastrado. Utilize outro!";
  } else if (!userExists) {
    return checkLogin ? "Aluno não encontrado no Banco de Dados" : null;
  }
}

async function validateOrientadores(email, checkLogin = false) {}

module.exports = {
  validateFields,
  validatePasswords,
  validateAdmins,
  validateAlunos,
  validateOrientadores,
};

const Aluno = require("../models/StudentModel");
const Orientador = require("../models/ProfessorModel");

// Acesso de Orientador para pegar IDs de Alunos
async function orientadorGetUserID(req, res) {
  try {
    const id = req.params.id;

    // "-password" faz com que a senha não seja exposta
    const aluno = await Aluno.findById(id, "-password");

    if (!aluno) {
      return res.status(404).json({ msg: "Aluno não encontrado!" });
    }

    res.status(200).json({ user: aluno });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Erro no servidor. Excedido número de caracteres de ID válido!",
    });
  }
}

// Acesso de Adiministrador para pegar IDs de Alunos e Orientadores
async function adminGetUserID(req, res) {
  const id = req.params.id;

  try {
    // Verifique o tipo de acesso do usuário com base no ID fornecido
    const aluno = await Aluno.findById(id, "-password");
    const orientador = await Orientador.findById(id, "-password");

    if (aluno) {
      return res.status(200).json({ user: aluno });
    } else if (orientador) {
      return res.status(200).json({ user: orientador });
    } else if (!aluno && !orientador) {
      return res.status(404).json({ msg: "Usuário não encontrado!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Erro no servidor. Excedido número de caracteres de ID válido!",
    });
  }
}

module.exports = {
  orientadorGetUserID,
  adminGetUserID,
};

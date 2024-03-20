const Aluno = require("../models/StudentModel");
const Orientador = require("../models/ProfessorModel");
const crypto = require("crypto");

// Password recovery
async function recoverPassword(req, res) {
  const { userEmail } = req.body;

  // Check if user (Student or Professor) exists
  const aluno = await Aluno.findOne({ email: userEmail });
  const orientador = await Orientador.findOne({ email: userEmail });

  if (!aluno && !orientador) {
    return res
      .status(404)
      .json({ msg: "Nenhum usuário cadastrado com esse email!" });
  }

  try {
    // Token criado para proteger requisição
    const token = crypto.randomBytes(20).toString("hex");

    // Expiration date - 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);

    if (aluno) {
      res.status(200).json({ msg: `Aluno ${aluno.name} encontrado!` });
      await Aluno.findByIdAndUpdate(aluno.id, {
        $set: {
          passwordResedToken: token,
          passwordResetExpires: now,
        },
      });
    } else if (orientador) {
      res
        .status(200)
        .json({ msg: `Orientador ${orientador.name} encontrado!` });
      await Orientador.findByIdAndUpdate(orientador.id, {
        $set: {
          passwordResedToken: token,
          passwordResetExpires: now,
        },
      });
    }

    console.log(token, now);
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Erro ao tentar recuperar senha. Tente novamente!" });
  }
}

module.exports = {
  recoverPassword,
};

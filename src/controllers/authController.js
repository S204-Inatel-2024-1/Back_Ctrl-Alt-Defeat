const Aluno = require("../models/StudentModel");
const Orientador = require("../models/ProfessorModel");
const crypto = require("crypto");
const mailer = require("../modules/nodemailer");

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
      await Aluno.findByIdAndUpdate(aluno.id, {
        $set: {
          passwordResedToken: token,
          passwordResetExpires: now,
        },
      });
    } else if (orientador) {
      await Orientador.findByIdAndUpdate(orientador.id, {
        $set: {
          passwordResedToken: token,
          passwordResetExpires: now,
        },
      });
    }

    // Send response with token and expiration
    // res.status(200).json({ msg: "Token gerado com sucesso!", token, now });

    await mailer.sendMail(
      {
        to: userEmail,
        from: "ctrlaltdefeat.com.br",
        subject: "Test",
        template: "forgotPassword",
        context: { token },
      },
      (err) => {
        if (err) {
          console.log(err);
          return res.status(400).json({ msg: "Erro ao enviar o email!" });
        }

        return res.status(200).json({ msg: "Email enviado com sucesso!" });
      }
    );
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Erro ao tentar recuperar senha. Tente novamente!" });
  }
}

module.exports = {
  recoverPassword,
};

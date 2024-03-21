const Aluno = require("../models/StudentModel");
const Orientador = require("../models/ProfessorModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mailer = require("../modules/nodemailer");

// Password recovery
async function recoverPassword(req, res) {
  const { userEmail } = req.body;

  // validation
  if (!userEmail) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

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
          passwordResetToken: token,
          passwordResetExpires: now,
        },
      });
    } else if (orientador) {
      await Orientador.findByIdAndUpdate(orientador.id, {
        $set: {
          passwordResetToken: token,
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

// Password recovery
async function resetPassword(req, res) {
  const { userEmail, token, newPassword, confirmPass } = req.body;

  // validations
  if (!userEmail) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!token) {
    return res.status(422).json({ msg: "O Token é obrigatório!" });
  }
  if (!newPassword) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }
  if (!confirmPass) {
    return res.status(422).json({ msg: "Obrigatório confirmar a senha!" });
  }

  if (newPassword !== confirmPass) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  // Check if user (Student or Professor) exists
  const aluno = await Aluno.findOne({ email: userEmail });
  const orientador = await Orientador.findOne({ email: userEmail });

  // const aluno = await Aluno.findOne({ email: userEmail }).select(
  //   "+passwordResetToken passwordResetExpires"
  // );
  // const orientador = await Orientador.findOne({ email: userEmail }).select(
  //   "+passwordResetToken passwordResetExpires"
  // );

  if (!aluno && !orientador) {
    return res
      .status(404)
      .json({ msg: "Nenhum usuário cadastrado com esse email!" });
  }

  try {
    if (aluno) {
      if (token !== aluno.passwordResetToken) {
        return res.status(400).json({ msg: "Token inválido!" });
      }

      const now = new Date();

      if (now > aluno.passwordResetExpires) {
        return res.status(400).json({ msg: "Token expirado!" });
      }

      // Create password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      aluno.password = passwordHash;
      aluno.passwordResetToken = undefined;
      aluno.passwordResetExpires = undefined;

      await aluno.save();
    } else if (orientador) {
      if (token !== orientador.passwordResetToken) {
        return res.status(400).json({ msg: "Token inválido!" });
      }

      const now = new Date();

      if (now > orientador.passwordResetExpires) {
        return res.status(400).json({ msg: "Token expirado!" });
      }

      // Create password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      orientador.password = passwordHash;
      orientador.passwordResetToken = undefined;
      orientador.passwordResetExpires = undefined;

      await orientador.save();
    }

    return res.status(200).json({ msg: "Senha resetada com sucesso!" });
  } catch (error) {
    res
      .status(400)
      .json({ msg: "Erro ao tentar resetar senha. Tente novamente!" });
  }
}

module.exports = {
  recoverPassword,
  resetPassword,
};

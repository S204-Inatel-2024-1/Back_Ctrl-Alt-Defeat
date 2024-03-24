const Aluno = require("../models/StudentModel");
const Orientador = require("../models/ProfessorModel");
const Equipe = require("../models/TeamModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mailer = require("../modules/nodemailer");
const controllerMid = require("../middlewares/controllerMiddleware");

// forgot Password
async function forgotPassword(req, res) {
  const { email } = req.body;

  const validations = controllerMid.validateFields([
    { key: email, message: "O email é obrigatório!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  // Check if user (Student or Professor) exists
  const aluno = await Aluno.findOne({ email });
  const orientador = await Orientador.findOne({ email });

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
        to: email,
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
  const { email, token, newPassword, confirmPass } = req.body;

  const validations = controllerMid.validateFields([
    { key: email, message: "O email é obrigatório!" },
    { key: token, message: "O token é obrigatório!" },
    { key: newPassword, message: "A nova senha é obrigatória!" },
    { key: confirmPass, message: "Obrigatório confirmar a senha!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  if (newPassword !== confirmPass) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  // Check if user (Student or Professor) exists
  const aluno = await Aluno.findOne({ email });
  const orientador = await Orientador.findOne({ email });

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

      // Create password using hash created by Bcrypt
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

// Register group Team
async function registerEquipe(req, res, next) {
  const { nameProjeto, members } = req.body;
  let userExists = undefined;
  let errorMsg = undefined;

  const validations = controllerMid.validateFields([
    { key: nameProjeto, message: "O nome do Projeto é obrigatório!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  const teamExists = await Equipe.findOne({ nameProjeto });

  if (teamExists) {
    return res.status(422).json({
      msg: `${teamExists.nameProjeto} já existente. Por favor crie outro!`,
    });
  }

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    userExists = await Aluno.findOne({ email: member.email });

    // Verifica se o objeto do membro está vazio
    if (Object.keys(member).length === 0 && member.constructor === Object) {
      next();
    } else {
      // Verifica se algum dos campos obrigatórios está ausente, caso um membro esteja parcialmente preenchido
      if (!member.name) {
        return res.status(422).json({
          msg: `Faltando preencher o campo de nome para o membro ${i + 1}!`,
        });
      } else if (!member.email) {
        return res.status(422).json({
          msg: `Faltando preencher o campo de email para o membro ${i + 1}!`,
        });
      } else if (!member.matricula) {
        return res.status(422).json({
          msg: `Faltando preencher o campo de matricula para o membro ${
            i + 1
          }!`,
        });
      }

      if (!userExists) {
        errorMsg = `Email ${member.email} não cadastrado no Banco de Dados!`;
        break;
      } else if (member.matricula !== userExists.matricula) {
        errorMsg = `Matrícula de ${member.email} incorreta de acordo com o Banco de Dados!`;
        break;
      }
    }
  }

  if (errorMsg) {
    return res.status(422).json({ msg: errorMsg });
  }

  try {
    // Create team
    // const equipe = new Equipe({
    //   nameProjeto,
    //   members,
    // });

    // await equipe.save();

    res.status(201).json({ msg: `Equipe ${nameProjeto} criada com sucesso!` });
  } catch (error) {}
}

module.exports = {
  forgotPassword,
  resetPassword,
  registerEquipe,
};

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
async function registerEquipe(req, res) {
  const { nameProjeto, members } = req.body;
  let errorMsg = undefined;

  const validations = controllerMid.validateFields([
    { key: nameProjeto, message: "O nome do Projeto é obrigatório!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  const equipeValidation = await controllerMid.validateEquipe(nameProjeto);

  if (equipeValidation) {
    return res.status(422).json({ msg: equipeValidation });
  }

  for (let i = 0; i < members.length; i++) {
    const member = members[i];

    // Verifica se o objeto do membro está vazio
    if (Object.keys(member).length === 0 && member.constructor === Object) {
    } else {
      // Verifica se algum dos campos obrigatórios está ausente, caso um membro esteja parcialmente preenchido
      if (!member.name) {
        errorMsg = `Faltando preencher o campo de nome para o membro ${i + 1}!`;
        break; // Interrompe o loop assim que um erro é encontrado
      } else if (!member.email) {
        errorMsg = `Faltando preencher o campo de email para o membro ${
          i + 1
        }!`;
        break;
      } else if (!member.matricula) {
        errorMsg = `Faltando preencher o campo de matricula para o membro ${
          i + 1
        }!`;
        break;
      } else {
        errorMsg = await controllerMid.validateEmailMat(
          member.email,
          member.matricula
        );

        if (errorMsg) {
          break;
        }
      }
    }
  }

  if (errorMsg) {
    return res.status(422).json({ msg: errorMsg }); // Envia a resposta com o erro encontrado
  }

  try {
    // Create team
    const equipe = new Equipe({
      nameProjeto,
      members,
    });

    await equipe.save();

    return res
      .status(201)
      .json({ msg: `Equipe ${nameProjeto} criada com sucesso!` });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Erro ao tentar registrar equipe. Tente novamente!" });
  }
}

// Get members from specific Team
async function getEquipeData(req, res) {
  try {
    const nameProjeto = req.params.projeto; // Acessando o parâmetro de consulta "projeto"
    let equipe = undefined;

    const equipeValidation = await controllerMid.validateEquipe(
      nameProjeto,
      true
    );

    if (equipeValidation) {
      return res.status(422).json({ msg: equipeValidation });
    } else {
      equipe = await Equipe.findOne({ nameProjeto });
    }

    return res.status(400).json({ members: equipe.members });
  } catch (error) {
    res.status(500).json({
      msg: "Erro no servidor. Entre com o nome do projeto da equipe desejada!",
    });
  }
}

module.exports = {
  forgotPassword,
  resetPassword,
  registerEquipe,
  getEquipeData,
};

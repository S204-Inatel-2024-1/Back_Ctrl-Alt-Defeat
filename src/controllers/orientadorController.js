const Orientador = require("../models/ProfessorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register user Orientador
async function registerOrientador(req, res) {
  const { nameOrientador, emailOrientador, passwordOrientador, confirmPass } =
    req.body;

  // Validations
  if (!nameOrientador) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }
  if (!emailOrientador) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!passwordOrientador) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }
  if (!confirmPass) {
    return res.status(422).json({ msg: "Obrigatório confirmar a senha!" });
  }

  if (passwordOrientador !== confirmPass) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  // Check if user exists
  const userExists = await Orientador.findOne({ email: emailOrientador });

  if (userExists) {
    return res.status(422).json({ msg: "Email existente. Utilize outro!" });
  }

  // Create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(passwordOrientador, salt);

  // Create user
  const userOrientador = new Orientador({
    name: nameOrientador,
    email: emailOrientador,
    acesso: "Orientador",
    password: passwordHash,
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
  });

  try {
    await userOrientador.save();
    res.status(201).json({ msg: "Orientador criado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
}

// Login user Orientador
async function loginOrientador(req, res) {
  const { emailOrientador, passwordOrientador } = req.body;

  if (!emailOrientador) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!passwordOrientador) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  // Check if user exists
  const user = await Orientador.findOne({ email: emailOrientador });

  if (!user) {
    return res.status(404).json({ msg: "Orientador não encontrado!" });
  }

  // Check if password matches
  const checkPass = await bcrypt.compare(passwordOrientador, user.password);

  if (!checkPass) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secretOrientador = process.env.SECRET_ORIENTADOR;

    const token = jwt.sign(
      {
        id: user._id,
        userType: "orientador",
      },
      secretOrientador
    );

    return res.status(200).json({
      msg: "Auntenticação Orientador realizada com sucesso!",
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
}

module.exports = {
  registerOrientador,
  loginOrientador,
};

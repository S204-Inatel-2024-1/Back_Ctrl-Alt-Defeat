const Orientador = require("../models/ProfessorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const controllerMid = require("../middlewares/controllerMiddleware");

// Register user Orientador
async function registerOrientador(req, res) {
  const { name, email, password, confirmPass } = req.body;

  const validations = controllerMid.validateFields([
    { key: name, message: "O nome é obrigatório!" },
    { key: email, message: "O email é obrigatório!" },
    { key: password, message: "A senha é obrigatória!" },
    { key: confirmPass, message: "Obrigatório confirmar a senha!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  if (password !== confirmPass) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  try {
    const userExists = await Orientador.findOne({ email });

    if (userExists) {
      return res.status(422).json({ msg: "Email existente. Utilize outro!" });
    }

    // Create password using hash created by Bcrypt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create orientador
    const orientador = new Orientador({
      name,
      email,
      acesso: "Orientador",
      password: passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    await orientador.save();
    res.status(201).json({ msg: "Orientador criado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
}

// Login user Orientador
async function loginOrientador(req, res) {
  const { email, password } = req.body;

  const validations = controllerMid.validateFields([
    { key: email, message: "O email é obrigatório!" },
    { key: password, message: "A senha é obrigatória!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  const orientador = await Orientador.findOne({ email });

  if (!orientador) {
    return res.status(404).json({ msg: "Orientador não encontrado!" });
  }

  // Check if passwords match
  const checkPass = await bcrypt.compare(password, orientador.password);

  if (!checkPass) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secretOrientador = process.env.SECRET_ORIENTADOR;

    const token = jwt.sign(
      {
        id: orientador._id,
        // userType: "orientador",
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

const Orientador = require("../models/ProfessorModel");
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

  const orientValidations = await controllerMid.validateOrientadores(email);

  if (orientValidations) {
    return res.status(422).json({ msg: orientValidations });
  }

  const passValidations = controllerMid.validatePasswords(
    password,
    confirmPass
  );

  if (passValidations) {
    return res.status(422).json({ msg: passValidations });
  }

  try {
    // Create password using hash created by Bcrypt
    const passwordHash = await controllerMid.createHash(password);

    // Create orientador
    const orientador = new Orientador({
      name,
      email,
      acesso: "Orientador",
      password: passwordHash,
      equipesOrientadas: undefined,
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
  let orientador = undefined;

  const validations = controllerMid.validateFields([
    { key: email, message: "O email é obrigatório!" },
    { key: password, message: "A senha é obrigatória!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  const orientValidations = await controllerMid.validateOrientadores(
    email,
    true
  );

  if (orientValidations) {
    return res.status(422).json({ msg: orientValidations });
  } else {
    orientador = await Orientador.findOne({ email });
  }

  const comparisonValidation = await controllerMid.comparePasswords(
    password,
    orientador.password
  );

  if (comparisonValidation) {
    return res.status(422).json({ msg: comparisonValidation });
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

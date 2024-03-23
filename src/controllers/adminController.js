const Admin = require("../models/AdminModel");
const jwt = require("jsonwebtoken");
const controllerMid = require("../middlewares/controllerMiddleware");

// Register user Admin
async function registerAdmin(req, res) {
  const { email, password, confirmPass } = req.body;

  const validations = controllerMid.validateFields([
    { key: email, message: "O email é obrigatório!" },
    { key: password, message: "A senha é obrigatória!" },
    { key: confirmPass, message: "Obrigatório confirmar a senha!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  const adminValidations = await controllerMid.validateAdmins(email);

  if (adminValidations) {
    return res.status(422).json({ msg: adminValidations });
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

    // Create admin
    const admin = new Admin({
      email,
      acesso: "Administrador",
      password: passwordHash,
    });

    await admin.save();

    res.status(201).json({ msg: "Administrador criado com sucesso!" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
}

// Login user Admin
async function loginAdmin(req, res) {
  const { email, password } = req.body;
  let admin = undefined;

  const validations = controllerMid.validateFields([
    { key: email, message: "O email é obrigatório!" },
    { key: password, message: "A senha é obrigatória!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  const adminValidations = await controllerMid.validateAdmins(email, true);

  if (adminValidations) {
    return res.status(422).json({ msg: adminValidations });
  } else {
    admin = await Admin.findOne({ email });
  }

  const comparisonValidation = await controllerMid.comparePasswords(
    password,
    admin.password
  );

  if (comparisonValidation) {
    return res.status(422).json({ msg: comparisonValidation });
  }

  try {
    const secretAdmin = process.env.SECRET_ADMIN;

    const token = jwt.sign(
      {
        id: admin._id,
        // userType: "administrador",
      },
      secretAdmin
    );

    return res.status(200).json({
      msg: "Auntenticação Administrador realizada com sucesso!",
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
};

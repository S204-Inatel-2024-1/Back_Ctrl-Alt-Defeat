const Admin = require("../models/AdminModel");
const bcrypt = require("bcrypt");
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

  if (password !== confirmPass) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  try {
    const userExists = await Admin.findOne({ email });

    if (userExists) {
      return res.status(422).json({ msg: "Email existente. Utilize outro!" });
    }

    // Create password using hash created by Bcrypt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

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

  const validations = controllerMid.validateFields([
    { key: email, message: "O email é obrigatório!" },
    { key: password, message: "A senha é obrigatória!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(404).json({ msg: "Administrador não encontrado!" });
  }

  // Check if passwords match
  const checkPass = await bcrypt.compare(password, admin.password);

  if (!checkPass) {
    return res.status(422).json({ msg: "Senha inválida!" });
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

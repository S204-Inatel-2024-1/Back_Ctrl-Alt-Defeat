const Admin = require("../models/AdminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register user Admin
async function registerAdmin(req, res) {
  const { emailAdmin, passwordAdmin, confirmPass } = req.body;

  // validations
  if (!emailAdmin) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!passwordAdmin) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }
  if (!confirmPass) {
    return res.status(422).json({ msg: "Obrigatório confirmar a senha!" });
  }

  if (passwordAdmin !== confirmPass) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  // Check if user exists
  const userExists = await Admin.findOne({ email: emailAdmin });

  if (userExists) {
    return res.status(422).json({ msg: "Email existente. Utilize outro!" });
  }

  // Create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(passwordAdmin, salt);

  // Create user
  const userAdmin = new Admin({
    email: emailAdmin,
    acesso: "Administrator",
    password: passwordHash,
  });

  try {
    await userAdmin.save();

    res.status(201).json({ msg: "Administrador criado com sucesso!" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
}

// Login user Admin
async function loginAdmin(req, res) {
  const { emailAdmin, passwordAdmin } = req.body;

  if (!emailAdmin) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!passwordAdmin) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  // Check if user exists
  const user = await Admin.findOne({ email: emailAdmin });

  if (!user) {
    return res.status(404).json({ msg: "Administrador não encontrado!" });
  }

  // Check if password matches
  const checkPass = await bcrypt.compare(passwordAdmin, user.password);

  if (!checkPass) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secretAdmin = process.env.SECRET_ADMIN;

    const token = jwt.sign(
      {
        id: user._id,
        userType: "administrador",
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

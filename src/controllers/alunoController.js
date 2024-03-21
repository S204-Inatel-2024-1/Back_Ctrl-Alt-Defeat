const Aluno = require("../models/StudentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register user Aluno
async function registerAluno(req, res) {
  const { nameAluno, emailAluno, matricula, passwordAluno, confirmPass } =
    req.body;

  // validations
  if (!nameAluno) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }
  if (!emailAluno) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!matricula) {
    return res.status(422).json({ msg: "A matricula é obrigatória!" });
  }
  if (!passwordAluno) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }
  if (!confirmPass) {
    return res.status(422).json({ msg: "Obrigatório confirmar a senha!" });
  }

  if (passwordAluno !== confirmPass) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  // Check if user exists
  const userExists = await Aluno.findOne({ email: emailAluno });

  if (userExists) {
    return res.status(422).json({ msg: "Email existente. Utilize outro!" });
  }

  // Create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(passwordAluno, salt);

  // Create user
  const userAluno = new Aluno({
    name: nameAluno,
    email: emailAluno,
    matricula,
    acesso: "Aluno",
    password: passwordHash,
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
  });

  try {
    await userAluno.save();

    res.status(201).json({ msg: "Aluno criado com sucesso!" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
}

// Login user Aluno
async function loginAluno(req, res) {
  const { emailAluno, passwordAluno } = req.body;

  if (!emailAluno) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!passwordAluno) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  // Check if user exists
  const user = await Aluno.findOne({ email: emailAluno });

  if (!user) {
    return res.status(404).json({ msg: "Aluno não encontrado!" });
  }

  // Check if password matches
  const checkPass = await bcrypt.compare(passwordAluno, user.password);

  if (!checkPass) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {
    const secretAluno = process.env.SECRET_ALUNO;

    const token = jwt.sign(
      {
        id: user._id,
        userType: "aluno",
      },
      secretAluno
    );

    return res
      .status(200)
      .json({ msg: "Auntenticação Aluno realizada com sucesso!", token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
}

module.exports = {
  registerAluno,
  loginAluno,
};

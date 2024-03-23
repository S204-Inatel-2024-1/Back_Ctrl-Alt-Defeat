const Aluno = require("../models/StudentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const controllerMid = require("../middlewares/controllerMiddleware");

// Register user Aluno
async function registerAluno(req, res) {
  const { name, email, matricula, password, confirmPass } = req.body;

  const validations = controllerMid.validateFields([
    { key: name, message: "O nome é obrigatório!" },
    { key: email, message: "O email é obrigatório!" },
    { key: matricula, message: "A matrícula é obrigatória!" },
    { key: password, message: "A senha é obrigatória!" },
    { key: confirmPass, message: "Obrigatório confirmar a senha!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  const passValidations = controllerMid.validatePasswords(
    password,
    confirmPass
  );

  if (passValidations) {
    return res.status(422).json({ msg: passValidations });
  }

  const alunoValidations = await controllerMid.validateAlunos(email);

  if (alunoValidations) {
    return res.status(422).json({ msg: alunoValidations });
  }

  try {
    // Create password using hash created by Bcrypt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create student
    const aluno = new Aluno({
      name,
      email,
      matricula,
      acesso: "Aluno",
      password: passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    await aluno.save();

    res.status(201).json({ msg: "Aluno criado com sucesso!" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ msg: "Erro no servidor!" });
  }
}

// Login user Aluno
async function loginAluno(req, res) {
  const { email, password } = req.body;
  let aluno = undefined;

  const validations = controllerMid.validateFields([
    { key: email, message: "O email é obrigatório!" },
    { key: password, message: "A senha é obrigatória!" },
  ]);

  if (validations) {
    return res.status(422).json({ msg: validations });
  }

  // if (!aluno) {
  //   return res
  //     .status(422)
  //     .json({ msg: "Aluno não encontrado no Banco de Dados" });
  // }

  const alunoValidations = await controllerMid.validateAlunos(email, true);

  if (alunoValidations) {
    return res.status(422).json({ msg: alunoValidations });
  } else {
    aluno = await Aluno.findOne({ email });
  }

  try {
    // Check if passwords match
    const checkPass = await bcrypt.compare(password, aluno.password);

    if (!checkPass) {
      return res.status(422).json({ msg: "Senha inválida!" });
    }

    const secretAluno = process.env.SECRET_ALUNO;

    const token = jwt.sign(
      {
        id: aluno._id,
        // userType: "aluno",
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

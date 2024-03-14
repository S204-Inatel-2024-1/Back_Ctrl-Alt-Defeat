const jwt = require("jsonwebtoken");

// Middleware Orientador
function checkTokenOrientador(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado. Sem token registrado!" });
  }

  try {
    const secretOrientador = process.env.SECRET_ORIENTADOR;

    jwt.verify(token, secretOrientador);

    next();
  } catch (error) {
    return res.status(400).json({
      msg: "Token inválido. Necessário possuir um token de Orientador!",
    });
  }
}

// Middleware Adimistrador
function checkTokenAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado. Sem token registrado!" });
  }

  try {
    const secretAdmin = process.env.SECRET_ADMIN;

    jwt.verify(token, secretAdmin);

    next();
  } catch (error) {
    return res.status(400).json({
      msg: "Token inválido. Necessário possuir um token de Administrador!",
    });
  }
}

module.exports = {
  checkTokenOrientador,
  checkTokenAdmin,
};

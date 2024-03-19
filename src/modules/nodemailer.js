const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

// Credencials
// const host = process.env.HOST_MAILER;
// const port = process.env.PORT_MAILER;
// const user = process.env.USER_MAILER;
// const pass = process.env.PASS_MAILER;

const { host, port, user, pass } = require("../config/mail.json");

var transport = nodemailer.createTransport({
  host,
  port,
  auth: {
    user,
    pass,
  },
});

module.exports = transport;
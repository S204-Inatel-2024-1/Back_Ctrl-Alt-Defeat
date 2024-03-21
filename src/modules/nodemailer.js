const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

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

// transport.use(
//   "compile",
//   hbs({
//     viewEngine: "handlebars",
//     viewPath: path.resolve("../resources/mail"),
//     extName: ".html",
//   })
// );

transport.use(
  "compile",
  hbs({
    viewEngine: {
      defaultLayout: undefined,
      partialsDir: path.resolve("./src/resources/mail/"),
    },
    viewPath: path.resolve("./src/resources/mail/"),
    extName: ".html",
  })
);

module.exports = transport;

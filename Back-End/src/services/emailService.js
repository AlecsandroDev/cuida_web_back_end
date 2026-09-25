const nodemailer = require("nodemailer");

// Configuração do transporter (exemplo usando SMTP padrão configurável no .env)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.enviarEmail = async ({ para, assunto, html }) => {
  if (!para || !process.env.EMAIL_USER) {
    console.warn("Disparo de e-mail ignorado: destinatário ou credenciais ausentes.");
    return;
  }

  return transporter.sendMail({
    from: `"CUIDA - Saúde Pública" <${process.env.EMAIL_USER}>`,
    to: para,
    subject: assunto,
    html: html
  });
};
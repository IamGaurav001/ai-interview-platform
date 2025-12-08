import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

export const sendEmail = async (to, subject, html) => {
  const emailTransporter = createTransporter();



  const mailOptions = {
    from: `"PrepHire Support" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  return await emailTransporter.sendMail(mailOptions);
};

// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer";
const sendMail = async (req, res) => {
  const { from, to, subject, text, html } = req.body;
  //   console.log(req.body);

  try {
    if (!from && !to && !subject) {
      res.status(401).json({ message: "missing arguments" });
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });
    if (!transporter) {
      res.status(500).json({ message: "unable to createTransporter" });
    }
    let info = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    if (!info) {
      res.status(500).json({ message: "unable to send mail" });
    }
    console.log(info.messageId);
    res.status(200).json(info);
  } catch (error) {
    res.status(500).json({ message: "unable to send mail" });
  }
};

export { sendMail };

import { Schedulemail } from "../models/schedulemail.model.js";
const tasks = [];

const sendMail = async (mailId) => {
  const mailData = await Schedulemail.findById(mailId);
  console.log(mailData);
  //   const transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     host: "smtp.gmail.com",
  //     port: 587,
  //     secure: false,
  //     auth: {
  //       user: process.env.EMAIL,
  //       pass: process.env.APP_PASSWORD,
  //     },
  //   });
  //   let info = await transporter.sendMail({
  //     from: mailData.from,
  //     to: mailData.to,
  //     subject: mailData.subject,
  //     text: mailData.text,
  //   });

  //once its completed update the status in database
};

export const addTask = async (mailId, date = Date.now()) => {
  //convert date to millisecond
  console.log("addTask", mailId);
  let t = setTimeout(sendMail, 1000, mailId);
  tasks.push(t);
  return tasks.length - 1;
};

export const removeTask = (index) => {
  clearTimeout(tasks[index]);
};

// exports = { addTask, removeTask };

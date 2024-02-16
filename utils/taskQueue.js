import { Schedulemail } from "../models/schedulemail.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { COMPLETED, FAILED, PENDING } from "../constants.js";

dotenv.config({
  path: "./env",
});

const tasks = {};

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

const sendMail = async (mailId) => {
  const mailData = await Schedulemail.findById(mailId);
  console.log(mailData);
  let date = new Date();
  console.log(date, mailData.date);

  let info = await transporter.sendMail({
    from: mailData.from,
    to: mailData.to,
    subject: mailData.subject,
    text: mailData.content,
  });

  console.log(info);

  let dem;

  if (info.response.split(" ")[0] === "250") {
    dem = await Schedulemail.findByIdAndUpdate(
      mailId,
      {
        $set: { status: COMPLETED, messageId: info.messageId },
        $unset: { taskId: 1 },
      },
      { new: true }
    );
  } else {
    dem = await Schedulemail.findByIdAndUpdate(
      mailId,
      {
        $set: { status: FAILED },
        $unset: { taskId: 1 },
      },
      { new: true }
    );
  }
  console.log(dem);

  //once its completed update the status in database
};

const getTimer = async (date) => {
  let currentdate = new Date().getTime();
  let scheduledDate = new Date(date).getTime();
  let timer = scheduledDate - currentdate;
  console.log(timer);

  return timer;
};

export const addTask = async (mailId, date) => {
  try {
    console.log("addTask", mailId);
    let counter = await getTimer(date);
    let t = setTimeout(sendMail, counter, mailId);
    tasks[mailId] = t;

    console.log(tasks);
    return true;
  } catch (error) {
    return false;
  }
};

export const removeTask = (mailId) => {
  clearTimeout(tasks[mailId]);
};

export const reScheduleTask = async (mailId, date) => {
  removeTask(mailId);
  let counter = await getTimer(date);
  tasks[mailId] = setTimeout(sendMail, counter, mailId);
  return true;
};

export const restartPendingTask = async () => {
  try {
    const unSentMails = await Schedulemail.find({ status: PENDING });

    console.log(unSentMails);

    if (unSentMails.length != 0) {
      unSentMails.map(async (mail) => {
        await addTask(mail._id, mail.date);
      });
    }

    console.log("tasks resheduled");
  } catch (error) {
    console.log(error);
  }
};

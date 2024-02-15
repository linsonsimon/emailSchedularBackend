import nodemailer from "nodemailer";
import { Schedulemail } from "../models/schedulemail.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { addTask, removeTask } from "../utils/taskQueue.js";

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

const scheduleMail = asyncHandler(async (req, res) => {
  //get data
  const { from, to, subject, content, date } = req.body;

  if (
    [from, subject, content].some((field) => {
      field?.trim() === "";
    }) &&
    to.length === 0
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const newMail = await Schedulemail.create({
    from: from,
    to: to,
    subject: subject,
    content: content,
    date: date,
  });

  if (!newMail) {
    throw new ApiError(500, "Something went wrong will scheduling the mail");
  }

  const taskid = await addTask(newMail._id, date);
  console.log(taskid);

  //   const maildata = await Schedulemail.findById(newMail._id);

  //   maildata.taskId = taskid;

  //   maildata.save();

  //save data to the database
  //create a setTimeout
  //save the timeout id to the database
  res.status(200).json(new ApiResponse(200, newMail, "scheduled successfully"));
});

const reScheduleMail = async (req, res) => {
  //fetch the data from the database
  //clear previously scheduled Timeout
  //create a new setTimeout
  //update the database with the new data
  const { mailId } = req.body;

  const maildata = await Schedulemail.findById(mailId);
};

const deleteScheduledMail = async (req, res) => {
  //find the data from the database
  //clear the Timeout
};

const viewUnSentScheduledMail = async (req, res) => {
  //fecth all the scheduled mails which are yet to be completed
};

const viewFailedScheduledMail = async (req, res) => {
  //fecth all the scheduled mails which are failed
};
export { sendMail, scheduleMail };

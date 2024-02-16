import nodemailer from "nodemailer";
import { Schedulemail } from "../models/schedulemail.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { addTask, removeTask } from "../utils/taskQueue.js";
import { PENDING, FAILED, COMPLETED, CANCELLED } from "../constants.js";

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

  try {
    if (
      [from, subject, content].some((field) => {
        console.log(field?.trim() === "", !field);
        return field?.trim() === "" || !field;
      })
    ) {
      console.log("error");
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

    const maildata = await Schedulemail.findById(newMail._id);

    maildata.taskId = taskid;

    maildata.save();

    res
      .status(200)
      .json(new ApiResponse(200, { newMail }, "scheduled successfully"));
  } catch (error) {
    res
      .status(error.statusCode)
      .json(new ApiResponse(error.statusCode, {}, error.message));
  }
});

const reScheduleMail = async (req, res) => {
  //fetch the data from the database
  //clear previously scheduled Timeout
  //create a new setTimeout
  //update the database with the new data
  const { mailId, from, to, subject, content, date } = req.body;

  try {
    if (
      [from, subject, content, mailId].some((field) => {
        return field?.trim() === "" || !field;
      }) &&
      to.length === 0
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const maildata = await Schedulemail.findByIdAndUpdate(mailId, {
      $set: { from: from, subject: subject, content: content, date: date },
    });

    if (!maildata) {
      throw new ApiError(401, "Invalid mailID");
    }

    const taskid = await addTask(maildata._id, date);
    console.log(taskid);

    res
      .status(200)
      .json(new ApiResponse(200, { maildata }, "reScheduled successfully"));
  } catch (error) {
    res
      .status(error.statusCode)
      .json(new ApiResponse(error.statusCode, {}, error.message));
  }
};

const deleteScheduledMail = async (req, res) => {
  //this will only delete the task from the schedule,
  //but the data will still be there in database with status as cancelled
  //find the data from the database
  //clear the Timeout
  const { mailId } = req.body;

  try {
    const maildata = await Schedulemail.findById(mailId);

    if (!maildata) {
      throw new ApiError(401, "Invalid mailID");
    }
    if (maildata.status === CANCELLED) {
      throw new ApiError(401, "task already cancelled");
    }
    if (maildata.status === COMPLETED) {
      throw new ApiError(401, "task already completed");
    }

    removeTask(maildata.taskId);

    const updatedMail = await Schedulemail.findByIdAndUpdate(
      mailId,
      {
        $unset: { taskId: 1 },
        $set: { status: CANCELLED },
      },
      { new: true }
    );

    res
      .status(200)
      .json(new ApiResponse(200, { updatedMail }, "deleted successfully"));
  } catch (error) {
    res
      .status(error.statusCode)
      .json(new ApiResponse(error.statusCode, {}, error.message));
  }
};

const viewUnSentScheduledMail = async (req, res) => {
  //fecth all the scheduled mails which are yet to be completed

  try {
    const unSentMails = await Schedulemail.find({ status: PENDING });

    if (!unSentMails) {
      throw new ApiError(404, "No mails available");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, { unSentMails }, "mails fetched successfully")
      );
  } catch (error) {
    res
      .status(error.statusCode)
      .json(new ApiResponse(error.statusCode, {}, error.message));
  }
};

const viewFailedScheduledMail = async (req, res) => {
  //fecth all the scheduled mails which are failed
  try {
    const failedMails = await Schedulemail.find({ status: FAILED });

    if (!failedMails) {
      throw new ApiError(404, "No mails available");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, { failedMails }, "mails fetched successfully")
      );
  } catch (error) {
    res
      .status(error.statusCode)
      .json(new ApiResponse(error.statusCode, {}, error.message));
  }
};

const viewCancelledScheduledMail = async (req, res) => {
  //fecth all the scheduled mails which are failed
  try {
    const cancelledMails = await Schedulemail.find({ status: CANCELLED });

    if (!cancelledMails) {
      throw new ApiError(404, "No mails available");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, { cancelledMails }, "mails fetched successfully")
      );
  } catch (error) {
    res
      .status(error.statusCode)
      .json(new ApiResponse(error.statusCode, {}, error.message));
  }
};
export {
  sendMail,
  scheduleMail,
  reScheduleMail,
  deleteScheduledMail,
  viewUnSentScheduledMail,
  viewFailedScheduledMail,
  viewCancelledScheduledMail,
};

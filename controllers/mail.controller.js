import nodemailer from "nodemailer";
import { Schedulemail } from "../models/schedulemail.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { addTask, removeTask, reScheduleTask } from "../utils/taskQueue.js";
import { PENDING, FAILED, COMPLETED, CANCELLED } from "../constants.js";

const sendMail = async (req, res) => {
  const { date, from, to, subject, content } = req.body;
  //   let currentdate = new Date().getTime();
  console.log(date, from, to, subject, content);

  try {
    res.status(200).json({ message: date });
  } catch (error) {
    res.status(500).json({ message: "unable to send mail" });
  }
};

const scheduleMail = asyncHandler(async (req, res) => {
  //get data
  const { from, to, subject, content, date } = req.body;

  console.log(from, to, subject, content, date);

  try {
    if (
      [from, subject, content, date].some((field) => {
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

    const isScheduled = await addTask(newMail._id, date);

    if (!isScheduled) {
      console.log("unable to schedule");
    }

    res
      .status(200)
      .json(new ApiResponse(200, { newMail }, "scheduled successfully"));
    // res.status(200).json({ message: date });
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
      [from, subject, content, date].every((field) => {
        return field?.trim() === "" || !field;
      }) &&
      (!to || to?.length === 0)
    ) {
      throw new ApiError(401, "No data provided to update");
    }

    const maildata = await Schedulemail.findByIdAndUpdate(
      mailId,
      {
        $set: { from: from, subject: subject, content: content, to: to },
      },
      { new: true }
    );

    if (!maildata) {
      throw new ApiError(401, "Invalid mailID");
    }
    if (maildata.status === COMPLETED) {
      throw new ApiError(401, "task already completed");
    }

    const isRescheduled = await reScheduleTask(maildata._id, date);
    if (!isRescheduled) {
      console.log("unable to reshedule");
    }

    res
      .status(200)
      .json(new ApiResponse(200, { maildata }, "reScheduled successfully"));
  } catch (error) {
    res
      .status(error.statusCode ? error.statusCode : 500)
      .json(
        new ApiResponse(
          error.statusCode ? error.statusCode : 500,
          {},
          error.message ? error.message : "Something went wrong while updating"
        )
      );
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

    removeTask(maildata._id);

    const updatedMail = await Schedulemail.findByIdAndUpdate(
      mailId,
      {
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

    console.log(unSentMails);

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

    console.log(failedMails);

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

    console.log(cancelledMails);

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

const viewCompletedScheduledMail = async (req, res) => {
  try {
    const completedMails = await Schedulemail.find({ status: COMPLETED });

    if (!completedMails) {
      throw new ApiError(404, "No mails available");
    }

    console.log(completedMails);

    res
      .status(200)
      .json(
        new ApiResponse(200, { completedMails }, "mails fetched successfully")
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
  viewCompletedScheduledMail,
};

import mongoose, { Schema } from "mongoose";
import { PENDING, FAILED, COMPLETED, CANCELLED } from "../constants.js";

const schedulemailSchema = new Schema(
  {
    from: {
      type: String,
      required: true,
    },
    to: [
      {
        type: String,
      },
    ],
    subject: {
      type: String,
    },
    content: {
      type: String,
    },
    date: { type: Date, required: true, default: Date.now() },
    taskId: {
      type: Number,
    },
    status: {
      type: String,
      enum: [PENDING, FAILED, COMPLETED, CANCELLED],
      default: PENDING,
    },
    messageId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Schedulemail = mongoose.model("ScheduleMail", schedulemailSchema);

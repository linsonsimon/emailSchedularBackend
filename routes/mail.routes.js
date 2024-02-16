import { Router } from "express";
import {
  scheduleMail,
  sendMail,
  reScheduleMail,
  deleteScheduledMail,
  viewUnSentScheduledMail,
  viewFailedScheduledMail,
  viewCancelledScheduledMail,
} from "../controllers/mail.controller.js";

const router = Router();

router.route("/").post(sendMail);
router.route("/schedule").post(scheduleMail);
router.route("/reSchedule").patch(reScheduleMail);
router.route("/delete").patch(deleteScheduledMail);
router.route("/getUnsent").get(viewUnSentScheduledMail);
router.route("/getfailed").get(viewFailedScheduledMail);
router.route("/getcancelled").get(viewCancelledScheduledMail);

export default router;

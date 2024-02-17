import { Router } from "express";
import {
  scheduleMail,
  sendMail,
  reScheduleMail,
  deleteScheduledMail,
  viewUnSentScheduledMail,
  viewFailedScheduledMail,
  viewCancelledScheduledMail,
  viewCompletedScheduledMail,
} from "../controllers/mail.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/").post(sendMail);
router
  .route("/schedule")
  .post(upload.fields([{ name: "attachments", maxCount: 1 }]), scheduleMail);
router
  .route("/reSchedule/:mailId")
  .patch(upload.fields([{ name: "attachments", maxCount: 1 }]), reScheduleMail);
router.route("/delete/:mailId").patch(deleteScheduledMail);
router.route("/getUnsent").get(viewUnSentScheduledMail);
router.route("/getfailed").get(viewFailedScheduledMail);
router.route("/getcancelled").get(viewCancelledScheduledMail);
router.route("/getCompleted").get(viewCompletedScheduledMail);

export default router;

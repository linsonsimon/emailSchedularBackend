import { Router } from "express";
import { scheduleMail, sendMail } from "../controllers/mail.controller.js";

const router = Router();

router.route("/").post(sendMail);
router.route("/schedule").post(scheduleMail);

export default router;

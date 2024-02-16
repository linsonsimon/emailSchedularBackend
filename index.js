import { app } from "./app.js";
import connectDB from "./db/index.js";

import dotenv from "dotenv";
import { restartPendingTask } from "./utils/taskQueue.js";

dotenv.config({
  path: "./env",
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
      restartPendingTask();
    });
  })
  .catch((err) => console.log("MONGO db connection failed !!! ", err));

app.get("/", (req, res) => {
  res.send("server running");
});

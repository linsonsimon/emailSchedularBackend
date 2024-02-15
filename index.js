import { app } from "./app.js";

import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log("post running on PORT 5000");
    });
  } catch (error) {}
};

start();

app.get("/", (req, res) => {
  res.send("server running");
});

import express from "express";
import cors from "cors";
import UserRoute from "./routes/noteRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(UserRoute);

const PORT = 5000;
app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
  });

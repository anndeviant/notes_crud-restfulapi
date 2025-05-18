import express from "express";
import cors from "cors";
import noteRoutes from "./routes/noteRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import setupAssociations from "./models/associations.js";

const app = express();

dotenv.config();

// Set up associations between models
setupAssociations();

app.use(cookieParser());
// Update CORS to allow all necessary methods
app.use(
  cors({
    credentials: true,
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(noteRoutes);
app.use(UserRoutes);

const PORT = 5000;
app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
  });

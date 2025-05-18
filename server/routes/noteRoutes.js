import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";

import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

// Ensure all routes are protected with verifyToken middleware
router.get("/notes", verifyToken, getNotes);
router.get("/notes/:id", verifyToken, getNoteById);
router.post("/notes", verifyToken, createNote);
router.put("/notes/:id", verifyToken, updateNote);
router.patch("/notes/:id", verifyToken, updateNote);
router.delete("/notes/:id", verifyToken, deleteNote);

export default router;

import Note from "../models/Note.js";
import User from "../models/UserModel.js";

const getNotes = async (req, res) => {
  try {
    console.log("getNotes called, user ID:", req.userId);

    const response = await Note.findAll({
      where: {
        userId: req.userId,
      },
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getNotes:", error);
    res.status(500).json({ message: error.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const response = await Note.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!response) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getNoteById:", error);
    res.status(500).json({ message: error.message });
  }
};

const createNote = async (req, res) => {
  try {
    console.log("createNote called, userId from token:", req.userId);
    console.log("Request body:", req.body);

    // Validate required fields
    if (!req.body.title || !req.body.content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    // Add userId from the token to the note
    const noteData = {
      ...req.body,
      userId: req.userId,
    };

    console.log("Creating note with data:", noteData);

    // Create the note
    const newNote = await Note.create(noteData);
    console.log("Note created successfully:", newNote.id);

    res.status(201).json({ message: "Note Created", data: newNote });
  } catch (error) {
    console.error("Error in createNote:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateNote = async (req, res) => {
  try {
    // Check if note exists and belongs to user
    const existingNote = await Note.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!existingNote) {
      return res
        .status(404)
        .json({ message: "Note not found or access denied" });
    }

    await Note.update(req.body, {
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    res.status(200).json({ message: "Note Updated" });
  } catch (error) {
    console.error("Error in updateNote:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    // Check if note exists and belongs to user
    const existingNote = await Note.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!existingNote) {
      return res
        .status(404)
        .json({ message: "Note not found or access denied" });
    }

    await Note.destroy({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    res.status(200).json({ message: "Note Deleted" });
  } catch (error) {
    console.error("Error in deleteNote:", error);
    res.status(500).json({ message: error.message });
  }
};

export { getNotes, getNoteById, createNote, updateNote, deleteNote };

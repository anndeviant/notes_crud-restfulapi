import Note from "../models/Note.js";

const getNotes = async (req, res) => {
  try {
    const response = await Note.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};

const getNoteById = async (req, res) => {
  try {
    const response = await Note.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};

const createNote = async (req, res) => {
  try {
    await Note.create(req.body);
    res.status(201).json({ message: "Note Created" });
  } catch (error) {
    console.log(error.message);
  }
};

const updateNote = async (req, res) => {
  try {
    await Note.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Note Updated" });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteNote = async (req, res) => {
  try {
    await Note.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Note Deleted" });
  } catch (error) {
    console.log(error.message);
  }
};

export { getNotes, getNoteById, createNote, updateNote, deleteNote };

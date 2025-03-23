const API_URL = "https://server-annas-298647753913.us-central1.run.app";
let notes = [];
let isEditing = false;

// DOM
const noteForm = document.getElementById("noteForm");
const formTitle = document.getElementById("formTitle");
const noteId = document.getElementById("noteId");
const title = document.getElementById("title");
const content = document.getElementById("content");
const priority = document.getElementById("priority");
const category = document.getElementById("category");
const cancelEdit = document.getElementById("cancelEdit");
const notesTableBody = document.getElementById("notesTableBody");

document.addEventListener("DOMContentLoaded", fetchNotes);

noteForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const noteData = {
    title: title.value,
    content: content.value,
    priority: priority.value,
    category: category.value || null,
  };

  if (isEditing) {
    updateNoteData(noteId.value, noteData);
  } else {
    createNoteData(noteData);
  }
});

cancelEdit.addEventListener("click", () => {
  isEditing = false;
  formTitle.textContent = "Create New Note";
  cancelEdit.style.display = "none";
});

function fetchNotes() {
  fetch(`${API_URL}/notes`)
    .then((response) => response.json())
    .then((data) => {
      notes = data;
      renderNotes();
    })
    .catch((error) => console.error("Error fetching notes:", error));
}

function renderNotes() {
  notesTableBody.innerHTML = "";

  notes.forEach((note) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${note.title}</td>
            <td>${
              note.content.length > 50
                ? note.content.substring(0, 50) + "..."
                : note.content
            }</td>
            <td>${note.priority}</td>
            <td>${note.category || "-"}</td>
            <td>
                <button class="edit" data-id="${note.id}">Edit</button>
                <button class="delete" data-id="${note.id}">Delete</button>
            </td>
        `;

    notesTableBody.appendChild(row);
  });

  document.querySelectorAll("button.edit").forEach((button) => {
    button.addEventListener("click", () => editNote(button.dataset.id));
  });

  document.querySelectorAll("button.delete").forEach((button) => {
    button.addEventListener("click", () => deleteNote(button.dataset.id));
  });
}

function createNoteData(noteData) {
  fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  })
    .then((response) => {
      if (response.ok) {
        fetchNotes();
      }
      return response.json();
    })
    .then((data) => console.log("Success:", data))
    .catch((error) => console.error("Error:", error));
}

function updateNoteData(id, noteData) {
  fetch(`${API_URL}/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  })
    .then((response) => {
      if (response.ok) {
        fetchNotes();
      }
      return response.json();
    })
    .then((data) => console.log("Success:", data))
    .catch((error) => console.error("Error:", error));
}

function deleteNote(id) {
  if (confirm("Are you sure you want to delete this note?")) {
    fetch(`${API_URL}/notes/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          fetchNotes();
        }
        return response.json();
      })
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
  }
}

function editNote(id) {
  const note = notes.find((note) => note.id == id);
  if (note) {
    isEditing = true;
    noteId.value = note.id;
    title.value = note.title;
    content.value = note.content;
    priority.value = note.priority;
    category.value = note.category || "";

    formTitle.textContent = "Edit Note";
    cancelEdit.style.display = "inline-block";
  }
}

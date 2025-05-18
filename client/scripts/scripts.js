const API_URL = "http://127.0.0.1:5000";
let notes = [];
let isEditing = false;
let currentUser = null;

// DOM Elements
const noteForm = document.getElementById("noteForm");
const formTitle = document.getElementById("formTitle");
const noteId = document.getElementById("noteId");
const title = document.getElementById("title");
const content = document.getElementById("content");
const priority = document.getElementById("priority");
const category = document.getElementById("category");
const cancelEdit = document.getElementById("cancelEdit");
const notesContainer = document.getElementById("notes-container");
const emptyState = document.getElementById("empty-state");
const logoutBtn = document.getElementById("logout-btn");
const userNameDisplay = document.getElementById("user-name");
const notesTitle = document.getElementById("notes-title");

// Enhanced token verification logic
function checkAuth() {
  if (!isAuthenticated()) {
    // Redirect to auth.html if not authenticated
    showToastAndRedirect("Session expired. Please login again.");
    return false;
  }
  return true;
}

// Helper function to show toast and redirect
function showToastAndRedirect(message) {
  // Create a toast that persists during redirect
  const toast = document.createElement("div");
  toast.className = "position-fixed top-0 end-0 p-3";
  toast.style.zIndex = 1050;
  toast.innerHTML = `
    <div class="toast show bg-warning text-dark" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">Authentication Alert</strong>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  // Set a short timeout before redirecting to allow the toast to be seen
  setTimeout(() => {
    window.location.replace("auth.html");
  }, 1500);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Immediately check authentication
  if (!checkAuth()) {
    return;
  }

  // Get current user data - log for debugging
  currentUser = getCurrentUser();
  console.log("Current user from localStorage:", currentUser);

  if (currentUser) {
    // Display user name in the navbar
    // userNameDisplay.textContent = currentUser.name || "";
    // console.log("Set navbar name to:", currentUser.name);

    // Display user name in the notes title
    if (notesTitle) {
      notesTitle.textContent = `${currentUser.name}'s Notes`;
      console.log("Set notes title to:", notesTitle.textContent);
    } else {
      console.warn("notesTitle element not found in the DOM");
    }
  } else {
    console.warn("No user data found in localStorage");
  }

  // Fetch notes
  fetchNotes();

  // Add logout event listener
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  } else {
    console.warn("Logout button not found");
  }
});

// Handle logout - Match server implementation
async function handleLogout() {
  try {
    console.log("Logging out...");
    // Call the logout function which will make the DELETE request
    await logout();

    // Redirect to auth page
    console.log("Redirecting to auth page");
    window.location.replace("auth.html");
  } catch (error) {
    console.error("Error during logout:", error);
    // Still redirect
    window.location.replace("auth.html");
  }
}

noteForm.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("Form submitted");

  const noteData = {
    title: title.value,
    content: content.value,
    priority: priority.value,
    category: category.value || null,
  };

  console.log("Note data:", noteData);

  if (isEditing) {
    updateNoteData(noteId.value, noteData);
  } else {
    createNoteData(noteData);
  }
});

cancelEdit.addEventListener("click", () => {
  resetForm();
});

// Improved fetch notes function with better token handling
function fetchNotes() {
  const token = localStorage.getItem("accessToken");

  axios
    .get(`${API_URL}/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Notes fetched:", response.data);
      notes = response.data;
      renderNotes();
    })
    .catch((error) => {
      console.error("Error fetching notes:", error);

      // Check if token is expired
      if (error.response && error.response.status === 403) {
        // Try to refresh the token
        refreshToken()
          .then(() => {
            // If successful, retry the fetch
            const newToken = localStorage.getItem("accessToken");
            return axios.get(`${API_URL}/notes`, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
          })
          .then((response) => {
            notes = response.data;
            renderNotes();
          })
          .catch((refreshError) => {
            // If refresh fails, show message and redirect
            console.error("Token refresh failed:", refreshError);
            showToastAndRedirect(
              "Your session has expired. Please login again."
            );
          });
      } else {
        showToast(
          "Failed to load notes: " +
            (error.response?.data?.message || error.message)
        );
      }
    });
}

function renderNotes() {
  // Clear existing notes
  notesContainer.innerHTML = "";

  // Show/hide empty state
  if (notes.length === 0) {
    emptyState.classList.remove("d-none");
    return;
  } else {
    emptyState.classList.add("d-none");
  }

  // Render notes
  notes.forEach((note) => {
    renderNoteCard(note);
  });
}

function renderNoteCard(note) {
  const formattedDate = new Date(
    note.updatedAt || note.createdAt
  ).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const noteCard = document.createElement("div");
  noteCard.className = `card shadow-sm note-card priority-${note.priority}`;

  noteCard.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title">${note.title}</h5>
                <span class="badge priority-${note.priority} rounded-pill">${
    note.priority
  }</span>
            </div>
            <p class="card-text note-content">${note.content}</p>
            <div class="note-meta">
                <div>
                    ${
                      note.category
                        ? `<span class="badge category-badge">${note.category}</span>`
                        : ""
                    }
                    <span class="note-date ms-2">${formattedDate}</span>
                </div>
                <div class="note-actions d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary edit" data-id="${
                      note.id
                    }">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete" data-id="${
                      note.id
                    }">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `;

  notesContainer.appendChild(noteCard);

  // Add event listeners for card actions
  const editBtn = noteCard.querySelector(".edit");
  const deleteBtn = noteCard.querySelector(".delete");

  editBtn.addEventListener("click", () => editNote(editBtn.dataset.id));
  deleteBtn.addEventListener("click", () => deleteNote(deleteBtn.dataset.id));
}

// Enhanced create note function
function createNoteData(noteData) {
  console.log("Sending note data:", noteData);
  const token = localStorage.getItem("accessToken");

  if (!token) {
    showToast("You need to be logged in to create notes");
    window.location.replace("auth.html");
    return;
  }

  // Add userId from currentUser if available
  if (currentUser && currentUser.id) {
    noteData.userId = currentUser.id;
  }

  axios
    .post(`${API_URL}/notes`, noteData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true, // Add this to include cookies
    })
    .then((response) => {
      console.log("Note created successfully:", response.data);
      fetchNotes();
      resetForm();
      showToast("Note created successfully!");
    })
    .catch((error) => {
      console.error("Error creating note:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        // Handle token expiry
        if (error.response.status === 403) {
          refreshToken()
            .then(() => {
              // Retry with new token
              const newToken = localStorage.getItem("accessToken");
              return axios.post(`${API_URL}/notes`, noteData, {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  "Content-Type": "application/json",
                },
                withCredentials: true,
              });
            })
            .then((response) => {
              console.log("Note created after token refresh:", response.data);
              fetchNotes();
              resetForm();
              showToast("Note created successfully!");
            })
            .catch((retryError) => {
              console.error("Failed after token refresh:", retryError);
              showToastAndRedirect(
                "Your session has expired. Please login again."
              );
            });
        } else {
          showToast(
            "Failed to create note: " +
              (error.response.data?.message || error.message)
          );
        }
      } else {
        showToast("Failed to create note: " + error.message);
      }
    });
}

// Enhanced update note function
function updateNoteData(id, noteData) {
  // Add Authorization header with token
  const token = localStorage.getItem("accessToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  axios
    .put(`${API_URL}/notes/${id}`, noteData, { headers })
    .then((response) => {
      fetchNotes();
      resetForm();
      showToast("Note updated successfully!");
    })
    .catch((error) => {
      // Handle token expiration
      if (error.response && error.response.status === 403) {
        refreshToken()
          .then(() => updateNoteData(id, noteData))
          .catch(() => {
            showToastAndRedirect(
              "Your session has expired. Please login again."
            );
          });
      } else {
        console.error("Error:", error);
        showToast("Failed to update note. Please try again.");
      }
    });
}

// Enhanced delete note function
function deleteNote(id) {
  if (confirm("Are you sure you want to delete this note?")) {
    // Add Authorization header with token
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .delete(`${API_URL}/notes/${id}`, { headers })
      .then((response) => {
        fetchNotes();
        showToast("Note deleted successfully!");
      })
      .catch((error) => {
        // Handle token expiration
        if (error.response && error.response.status === 403) {
          refreshToken()
            .then(() => deleteNote(id))
            .catch(() => {
              showToastAndRedirect(
                "Your session has expired. Please login again."
              );
            });
        } else {
          console.error("Error:", error);
          showToast("Failed to delete note. Please try again.");
        }
      });
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

    // Scroll to form on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
}

function resetForm() {
  isEditing = false;
  noteForm.reset();
  formTitle.textContent = "Create New Note";
  cancelEdit.style.display = "none";
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "position-fixed top-0 end-0 p-3";
  toast.style.zIndex = 1050;
  toast.innerHTML = `
    <div class="toast show bg-white" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">Notification</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);

  // Add event listener to close button
  const closeButton = toast.querySelector(".btn-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    });
  }
}

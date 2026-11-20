const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// ---- helpers: read and write notes.json ----
function readNotes() {
  try {
    const data = fs.readFileSync("notes.json", "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return []; // file missing or empty
  }
}

function writeNotes(notes) {
  fs.writeFileSync("notes.json", JSON.stringify(notes, null, 2));
}

// ---- routes ----
app.get("/", (req, res) => {
  res.send("Welcome to my Notes server");
});

app.get("/notes", (req, res) => {
  res.json(readNotes());
});

app.get("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = readNotes().find((n) => n.id === id);

  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }
  res.json(note);
});

app.post("/notes", (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const notes = readNotes();
  const newNote = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
  };

  notes.push(newNote);
  writeNotes(notes);
  res.status(201).json(newNote);
});

app.put("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const notes = readNotes();
  const note = notes.find((n) => n.id === id);

  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  if (req.body.title) note.title = req.body.title;
  if (req.body.content) note.content = req.body.content;

  writeNotes(notes);
  res.json(note);
});

app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const notes = readNotes();
  const index = notes.findIndex((n) => n.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Note not found" });
  }

  notes.splice(index, 1);
  writeNotes(notes);
  res.json({ message: "Note deleted" });
});

// ---- start the server (always at the bottom) ----
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
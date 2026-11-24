require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ---- connect to the database ----
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB error:", err.message));

// ---- what a note looks like ----
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
});

// MongoDB uses _id. This turns it into "id" so the website still works.
noteSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

const Note = mongoose.model("Note", noteSchema);

// ---- routes ----
app.get("/", (req, res) => {
  res.send("Welcome to my Notes server");
});

app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/notes/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Note not found" });
    }
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/notes", async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const note = await Note.create({
      title: body.title,
      content: body.content,
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/notes/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Note not found" });
    }
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, content: req.body.content },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/notes/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Note not found" });
    }
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ---- start the server (always at the bottom) ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
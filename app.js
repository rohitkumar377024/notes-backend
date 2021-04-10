const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Note structure (schema)
const noteSchema = mongoose.Schema({
  name: String,
  content: String,
  image: String, //URL of the image for a specific note
});

// Share Link (schema)
const linkSchema = mongoose.Schema({
  noteId: String,
  linkId: String, //Shareable URL
});

// Mongoose models
const Note = mongoose.model("notes", noteSchema);
const Link = mongoose.model("links", linkSchema);

// Search notes via title and content
app.get("/notes/search", async (req, res) => {
  try {
    const { query } = req.query;
    const notes = await Note.find();

    const noteName = note.name.toLowerCase();
    const noteContent = note.content.toLowerCase();
    const queryString = query.toLowerCase();

    const searchResults = notes.filter(note => {
      if (noteName.includes(queryString) || noteContent.includes(queryString)) {
        return note;
      }
    });

    res.send(searchResults);
  } catch (err) {
    res.send(`Error: ${err}`);
  }
});

// Get all notes
app.get("/notes", (req, res) =>
  Note.find((err, result) =>
    err ? res.send(`Error: ${err}`) : res.send(result)
  )
);

// Create note
app.post("/notes", (req, res) => {
  const { name, content, image } = req.body;
  new Note({ name, content, image }).save((err, result) =>
    err ? res.send(`Error: ${err}`) : res.send(result)
  );
});

// Get specific note
app.get("/notes/:id", (req, res) =>
  Note.findOne({ _id: req.params.id }, (err, result) =>
    err ? res.send(`Error: ${err}`) : res.send(result)
  )
);

// Update note
app.put("/notes/:id", (req, res) =>
  Note.updateOne({ _id: req.params.id }, req.body, (err, result) =>
    err ? res.send(`Error: ${err}`) : res.send(result)
  )
);

// Delete note
app.delete("/notes/:id", (req, res) =>
  Note.deleteOne({ _id: req.params.id }, (err, result) =>
    err ? res.send(`Error: ${err}`) : res.send(result)
  )
);

// Create new share link
app.post("/links/new", (req, res) => {
  const { noteId } = req.query;
  const linkId = generateShareLinkID(10);
  new Link({ noteId, linkId }).save((err, result) =>
    err ? res.send(`Error: ${err}`) : res.send(`Your share URL is: ${linkId}`)
  );
});

// Generate share link ID
function generateShareLinkID(length) {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}

// Get share link content
app.get("/links/:shareURL", async (req, res) => {
  try {
    const link = await Link.findOne({ linkId: req.params.shareURL });
    const note = await Note.findOne({ _id: link.noteId });
    res.send(note);
  } catch (err) {
    res.send(`Error: ${err}`);
  }
});

mongoose.connect(
  "mongodb+srv://admin-rohit:test123@cluster0-exv7e.mongodb.net/notes"
);
app.listen(3000, () => console.log("Listening on Port 3000"));

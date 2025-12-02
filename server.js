const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const cors = require("cors")
app.use(cors());

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect MongoDB (we will fill this later)
mongoose.connect("mongodb+srv://ceaselesslogout:Makeins1@cluster0.rzuy9sl.mongodb.net/?&appName=cluster0")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Database Models
const User = mongoose.model("User", new mongoose.Schema({
    username: String,
    password: String,
    profilePic: String
}));

const Message = mongoose.model("Message", new mongoose.Schema({
    from: String,
    to: String,
    text: String,
    time: Number
}));

// Setup Multer
const storage = multer.diskStorage({
    destination: "../uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Routes will be added later...
// SIGNUP
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    const exists = await User.findOne({ username });
    if (exists) return res.json({ error: "Username already taken" });

    await User.create({ username, password });
    res.json({ success: true });
});

// LOGIN
app.post("/login", async (req, res) => {
    const user = await User.findOne(req.body);
    if (!user) return res.json({ error: "Invalid username or password" });

    res.json({ success: true, user });
});

// UPLOAD PROFILE PICTURE
app.post("/upload-pic/:username", upload.single("pic"), async (req, res) => {
    const filename = "/uploads/" + req.file.filename;

    await User.updateOne(
        { username: req.params.username },
        { profilePic: filename }
    );

    res.json({ success: true, url: filename });
});

// GET ALL USERS
app.get("/users", async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// SEND MESSAGE
app.post("/send", async (req, res) => {
    await Message.create(req.body);
    res.json({ success: true });
});

// GET CHAT MESSAGES
app.post("/messages", async (req, res) => {
    const { user1, user2 } = req.body;

    const messages = await Message.find({
        $or: [
            { from: user1, to: user2 },
            { from: user2, to: user1 }
        ]
    }).sort({ time: 1 });

    res.json(messages);
});



app.listen(3000, () => {
    console.log("Server running on port 3000");
});
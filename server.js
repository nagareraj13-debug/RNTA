const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 Database Connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.log("🔴 ERROR: MONGO_URI is missing. Please set it in Render Environment Variables.");
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log("🟢 MongoDB Ekdam Kadak Connected to RNTA_DB!"))
        .catch(err => console.log("🔴 MongoDB Connection Error:", err));
}

// ================= 1. USER SCHEMA & API =================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Signup Route
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;
        
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this Email or Mobile!" });
        }

        const newUser = new User({ name, email, mobile, password });
        await newUser.save();
        
        res.status(201).json({ success: true, message: "Account created successfully!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Server Error during signup." });
    }
});

// ================= 2. CLIENT MESSAGE SCHEMA & API =================
const messageSchema = new mongoose.Schema({
    clientName: { type: String, default: "Client" },
    clientEmail: { type: String, default: "Anonymous" },
    message: { type: String, required: true },
    status: { type: String, default: "Unread" },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Client kadun Message Save karnyachi API
app.post('/api/message', async (req, res) => {
    try {
        const { clientName, clientEmail, message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message content cannot be empty!" });
        }

        const newMsg = new Message({
            clientName: clientName || "RNTA Client",
            clientEmail: clientEmail || "guest@rnta.agency",
            message
        });

        await newMsg.save();
        res.status(200).json({ success: true, message: "Command received & saved in RNTA Database!" });
    } catch (error) {
        console.error("Message Error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Admin Panel sathi Sagale Messages Baghnyachi API
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Fetch Messages Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch messages." });
    }
});

// Default Testing Route
app.get('/', (req, res) => {
    res.send("RNTA Backend Server is LIVE on Render! 🚀");
});

// Server Start
app.listen(PORT, () => {
    console.log(`🚀 RNTA Server is running on port ${PORT}`);
});

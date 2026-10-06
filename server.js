const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Render automatically ek port deto, nahitar 10000 varel
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

// 📝 User Schema & Model (Database Structure)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true }, // Pudhe apan he password secure karu
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 🚀 API: Signup Route (Navin user save karnyasaathi)
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists with this Email or Mobile!" });
        }

        // Save new user to RNTA_DB
        const newUser = new User({ name, email, mobile, password });
        await newUser.save();
        
        res.status(201).json({ success: true, message: "Account created successfully!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Server Error during signup." });
    }
});

// Default Testing Route
app.get('/', (req, res) => {
    res.send("RNTA Backend Server is LIVE on Render! 🚀");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 RNTA Server is running on port ${PORT}`);
});
            

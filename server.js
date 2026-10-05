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

// 🔥 Database Connection (Render varun link yeil)
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.log("🔴 ERROR: MONGO_URI is missing. Please set it in Render Environment Variables.");
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log("🟢 MongoDB Ekdam Kadak Connected!"))
        .catch(err => console.log("🔴 MongoDB Connection Error:", err));
}

// Default Testing Route
app.get('/', (req, res) => {
    res.send("RNTA Backend Server is LIVE on Render! 🚀");
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 RNTA Server is running on port ${PORT}`);
});

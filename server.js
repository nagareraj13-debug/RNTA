const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // Allows all frontend connections

// 🚀 HARDCODED MONGO URI - Bypassing Render Environment Variables completely
const MONGO_URI = "mongodb+srv://nagareraj13_db_user:RajRNTA2026@cluster0.8yxlwed.mongodb.net/RNTA_DB?retryWrites=true&w=majority";

// Connection logic with strict timeout handling
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log("✅ MongoDB Connected Successfully to RNTA_DB!");
}).catch(err => {
    console.error("❌ MongoDB Connection FATAL Error:", err);
});

// Message Schema
const messageSchema = new mongoose.Schema({
    clientName: String,
    clientEmail: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Chat API Route
app.post('/api/message', async (req, res) => {
    console.log("📩 Incoming message request:", req.body);
    
    try {
        // Strict DB Connection Check
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected. Render IP might be blocked or URI is wrong.");
        }

        const newMessage = new Message({
            clientName: req.body.clientName || "Ruhi",
            clientEmail: req.body.clientEmail || "client@rnta.agency",
            message: req.body.message
        });

        await newMessage.save();
        console.log("✅ Message saved to DB!");
        res.status(200).json({ success: true, message: "Message saved successfully!" });
        
    } catch (error) {
        console.error("❌ Error saving message:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Health Check Route
app.get('/', (req, res) => {
    res.send("RNTA Backend is Running Live with Hardcoded DB! 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

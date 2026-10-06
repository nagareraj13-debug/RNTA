const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); 

// 🔥 TYPO FIXED HERE (byxlwwd instead of 8yxlwed)
const MONGO_URI = "mongodb+srv://nagareraj13_db_user:RajRNTA2026@cluster0.byxlwwd.mongodb.net/RNTA_DB?retryWrites=true&w=majority&appName=Cluster0";

let dbErrorDetail = "Database connection is initializing... please wait.";

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => { 
        dbErrorDetail = null; 
        console.log("✅ MongoDB Connected Successfully!"); 
    })
    .catch(err => { 
        dbErrorDetail = err.message; 
        console.error("❌ DB Error:", err.message); 
    });

const messageSchema = new mongoose.Schema({
    clientName: String,
    clientEmail: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

app.post('/api/message', async (req, res) => {
    try {
        if (dbErrorDetail) {
            return res.status(500).json({ success: false, message: `DB ERROR: ${dbErrorDetail}` });
        }

        const newMessage = new Message({
            clientName: req.body.clientName || "Ruhi",
            clientEmail: req.body.clientEmail || "client@rnta.agency",
            message: req.body.message
        });

        await newMessage.save();
        res.status(200).json({ success: true, message: "Message saved successfully!" });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/', (req, res) => {
    res.send("RNTA Backend is Running Live! 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

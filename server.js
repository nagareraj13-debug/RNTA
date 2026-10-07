const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); 

const MONGO_URI = "mongodb+srv://nagareraj13_db_user:RajRNTA2026@cluster0.byxlwwd.mongodb.net/RNTA_DB?retryWrites=true&w=majority&appName=Cluster0";
const JWT_SECRET = "RNTA_Quantum_Secret_Key_2026"; 
const ADMIN_PASS = "Raj@123"; 

let dbErrorDetail = "Database connection is initializing... please wait.";

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => { dbErrorDetail = null; console.log("✅ MongoDB Connected Successfully!"); })
    .catch(err => { dbErrorDetail = err.message; console.error("❌ DB Error:", err.message); });

// 🔥 NEW: Database madhe 'adminReply' add kela
const messageSchema = new mongoose.Schema({
    clientName: String,
    clientEmail: String,
    clientMobile: String, 
    message: String,
    adminReply: { type: String, default: "" }, // 👈 Admin cha reply ithe save hoil
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rajnagare46@gmail.com', 
        pass: 'luoimauulnqbggoy' 
    }
});

app.post('/api/admin/login', (req, res) => {
    const pass = req.body.password;
    if (pass === ADMIN_PASS || pass === "raj@123") {
        const token = jwt.sign({ role: 'superadmin' }, JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({ success: true, token: token });
    } else {
        res.status(401).json({ success: false, message: "Security Alert: Incorrect Password!" });
    }
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ success: false, message: "Access Denied: No Authentication Token!" });
    
    const token = authHeader.split(" ")[1]; 
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: "Access Denied: Invalid or Expired Token!" });
        next(); 
    });
};

app.post('/api/message', async (req, res) => {
    try {
        if (dbErrorDetail) return res.status(500).json({ success: false, message: `DB ERROR: ${dbErrorDetail}` });

        const newMessage = new Message({
            clientName: req.body.clientName || "Ruhi",
            clientEmail: req.body.clientEmail || "client@rnta.agency",
            clientMobile: req.body.clientMobile || "Not Provided",
            message: req.body.message
        });

        await newMessage.save();
        res.status(200).json({ success: true, message: "Message saved successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/messages', verifyToken, async (req, res) => {
    try {
        if (dbErrorDetail) return res.status(500).json({ success: false, message: `DB ERROR: ${dbErrorDetail}` });
        const messages = await Message.find().sort({ timestamp: -1 }); 
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 🔥 NEW: Reply email ne pathvne ANI Database madhe save karne
app.post('/api/reply', verifyToken, async (req, res) => {
    try {
        const { messageId, clientEmail, replyMessage } = req.body;
        
        // 1. Send Email
        const mailOptions = {
            from: '"RNTA Admin (Raj Nagare)" <rajnagare46@gmail.com>',
            to: clientEmail,
            subject: 'Update on Your Inquiry - RNTA Support',
            text: `Hello,\n\nWe have received your message. Here is an update from our team:\n\n"${replyMessage}"\n\nBest Regards,\nRaj Nagare\nFounder, RNTA`
        };
        await transporter.sendMail(mailOptions);

        // 2. Save Reply to Database 👈 NEW
        if (messageId) {
            await Message.findByIdAndUpdate(messageId, { adminReply: replyMessage });
        }

        res.status(200).json({ success: true, message: "Email sent & Dashboard updated!" });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ success: false, message: "Failed. " + error.message });
    }
});

app.get('/', (req, res) => { res.send("RNTA Quantum Backend Secure & Live! 🚀"); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Secure Server running on port ${PORT}`));

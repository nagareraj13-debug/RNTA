const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); // 🔥 Email sathi navin package

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); 

const MONGO_URI = "mongodb+srv://nagareraj13_db_user:RajRNTA2026@cluster0.byxlwwd.mongodb.net/RNTA_DB?retryWrites=true&w=majority&appName=Cluster0";

let dbErrorDetail = "Database connection is initializing... please wait.";

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => { dbErrorDetail = null; console.log("✅ MongoDB Connected Successfully!"); })
    .catch(err => { dbErrorDetail = err.message; console.error("❌ DB Error:", err.message); });

const messageSchema = new mongoose.Schema({
    clientName: String,
    clientEmail: String,
    clientMobile: String, 
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// 🔥 Email Transporter Setup (Tuza Gmail ani App Password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rajnagare46@gmail.com', 
        pass: 'luoimauulnqbggoy' // 🔥 Password spaces kadhun takla ahe
    }
});

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

app.get('/api/messages', async (req, res) => {
    try {
        if (dbErrorDetail) return res.status(500).json({ success: false, message: `DB ERROR: ${dbErrorDetail}` });
        const messages = await Message.find().sort({ timestamp: -1 }); 
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 🔥 Navin API: Admin kadun direct email pathvnyasathi
app.post('/api/reply', async (req, res) => {
    try {
        const { clientEmail, replyMessage } = req.body;
        
        const mailOptions = {
            from: '"RNTA Admin (Raj Nagare)" <rajnagare46@gmail.com>',
            to: clientEmail,
            subject: 'Update on Your Inquiry - RNTA Support',
            text: `Hello,\n\nWe have received your message. Here is an update from our team:\n\n"${replyMessage}"\n\nBest Regards,\nRaj Nagare\nFounder, RNTA`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email successfully delivered to client!" });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ success: false, message: "Failed to send email. " + error.message });
    }
});

app.get('/', (req, res) => { res.send("RNTA Backend Live & Email Ready! 🚀"); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    

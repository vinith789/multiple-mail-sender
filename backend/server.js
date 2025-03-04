require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.post("/send-email", async (req, res) => {
    const { emailsData, subject, message } = req.body;

    try {
        for (const { email, roles } of emailsData) {
            let personalizedMessage = message;
            roles.forEach((role, index) => {
                personalizedMessage = personalizedMessage.replace(new RegExp(`{role${index + 1}}`, 'g'), role);
            });

            let info = await transporter.sendMail({
                from: `"Vinith" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: subject,
                text: personalizedMessage
            });

            console.log(`✅ Email sent to ${email}: ${info.response}`);
        }
        res.json({ message: "Emails sent successfully!" });
    } catch (error) {
        console.error("❌ Error sending emails:", error);
        res.status(500).json({ message: "Failed to send emails.", error: error.message });
    }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));

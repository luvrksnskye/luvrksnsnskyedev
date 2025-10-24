// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
    origin: [
        'https://luvrksnsnskyedev.space',
        'http://localhost:5500', // For local development wiiii
        'http://127.0.0.1:5500'  // Alternative localhost
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Nodemailer transporter for iCloud
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.ICLOUD_EMAIL, // My iCloud email
        pass: process.env.ICLOUD_APP_PASSWORD // The app password I generated
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error connecting to email server:', error);
    } else {
        console.log('✅ Email server ready to send messages');
    }
});

// Main route to verify the server is working
app.get('/', (req, res) => {
    res.json({ 
        message: '✨ Contact server running successfully',
        status: 'online'
    });
});

// Route to handle contact form submissions
app.post('/api/contact', async (req, res) => {
    try {
        const { email, username, topic, message } = req.body;

        // Validate that all fields are present
        if (!email || !username || !topic || !message) {
            return res.status(400).json({ 
                error: 'Please fill in all fields' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Invalid email format' 
            });
        }

        // Configure email content
        const mailOptions = {
            from: `"Contact Form" <${process.env.ICLOUD_EMAIL}>`,
            to: process.env.ICLOUD_EMAIL, // Your email where you'll receive messages
            replyTo: email, // The user's email who sent the message
            subject: `📬 New contact message: ${topic}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            border-radius: 10px 10px 0 0;
                            text-align: center;
                        }
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .field {
                            margin-bottom: 20px;
                        }
                        .field-label {
                            font-weight: bold;
                            color: #667eea;
                            margin-bottom: 5px;
                        }
                        .field-value {
                            background: white;
                            padding: 15px;
                            border-radius: 5px;
                            border-left: 4px solid #667eea;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #888;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>💌 New Contact Message</h2>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="field-label">👤 Name / Username:</div>
                            <div class="field-value">${username}</div>
                        </div>
                        
                        <div class="field">
                            <div class="field-label">📧 Email:</div>
                            <div class="field-value"><a href="mailto:${email}">${email}</a></div>
                        </div>
                        
                        <div class="field">
                            <div class="field-label">📝 Topic:</div>
                            <div class="field-value">${topic}</div>
                        </div>
                        
                        <div class="field">
                            <div class="field-label">💬 Message:</div>
                            <div class="field-value">${message}</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This message was sent from your web contact form</p>
                        <p>You can reply directly to this email to contact ${username}</p>
                    </div>
                </body>
                </html>
            `,
            // Plain text version in case the email client doesn't support HTML
            text: `
New Contact Message

Name: ${username}
Email: ${email}
Topic: ${topic}

Message:
${message}
            `
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent:', info.messageId);
        console.log(`📧 From: ${username} (${email})`);
        console.log(`📝 Topic: ${topic}`);

        res.status(200).json({ 
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('❌ Error sending email:', error);
        res.status(500).json({ 
            error: 'There was a problem sending the message. Please try again.' 
        });
    }
});

// Handle 404 - Route not found
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📮 Contact endpoint available at http://localhost:${PORT}/api/contact`);
});
require('dotenv').config();
const express = require('express');
const { createTransport } = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');

const app = express();
app.set('trust proxy', 1); 

// 🛡️ Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 🌐 CORS configuration
app.use(cors({
  origin: [
    'https://luvrksnskye.github.io',
    'https://luvrksnsnskyedev.neocities.org',
    'https://luvrksnsnskyedev-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:5500'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Respond to preflight requests
app.options('*', cors());

// 🪶 Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

// ⚙️ Rate limiting for contact form
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many contact attempts from this IP, please try again later.'
  }
});
app.use('/api/contact', limiter);

// 📧 Email transporter for iCloud
const createTransporter = () => {
  return createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS  
    },
    tls: {
      rejectUnauthorized: true
    }
  });
};

// ✅ Test the connection
const transporter = createTransporter();
transporter.verify()
  .then(() => console.log("✅ iCloud SMTP verified successfully"))
  .catch(err => console.error("❌ iCloud SMTP error:", err));

// 🩺 Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Skye Contact API',
    timestamp: new Date().toISOString()
  });
});

// 💌 Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('Contact form submission received:', {
    email: req.body.email,
    username: req.body.username,
    topic: req.body.topic,
    messageLength: req.body.message?.length
  });

  try {
    const { email, username, topic, message } = req.body;

    // 🧩 Validation
    if (!email || !username || !topic || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (username.trim().length < 2) {
      return res.status(400).json({ error: 'Name should be at least 2 characters long' });
    }

    if (topic.trim().length < 3) {
      return res.status(400).json({ error: 'Topic should be at least 3 characters long' });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ error: 'Message should be at least 10 characters long' });
    }

    // 🔮 Create transporter and verify
    const transporter = createTransporter();
    await transporter.verify();

    // ✨ Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to me
      replyTo: email, // User's email for easy replies
      subject: `🌙 Portfolio Contact: ${topic}`,
      html: `
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .field { margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea; }
              .field-label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
              .message-content { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e1e1e1; }
              .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ New Portfolio Contact</h1>
                <p>Someone reached out through your website!</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="field-label">👤 From</div>
                  <div>${username} (${email})</div>
                </div>
                <div class="field">
                  <div class="field-label">💬 Topic</div>
                  <div>${topic}</div>
                </div>
                <div class="field">
                  <div class="field-label">📝 Message</div>
                  <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
              <div class="footer">
                <p>This message was sent from your portfolio contact form at ${new Date().toLocaleString()}</p>
                <p>💖 Skye's Portfolio System</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Portfolio Contact Form Submission

From: ${username} (${email})
Topic: ${topic}
Message:
${message}

Sent from Skye's portfolio website at ${new Date().toLocaleString()}
      `
    };

    // 📤 Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', process.env.EMAIL_USER);

    res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    });

  } catch (error) {
    console.error('Error sending email:', error);

    let errorMessage = 'Failed to send email. Please try again later.';
    if (error.code === 'EAUTH') errorMessage = 'Email configuration error. Please check your email settings.';
    else if (error.code === 'ECONNECTION') errorMessage = 'Cannot connect to email service. Please try again later.';

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// 🌐 Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Skye Portfolio Contact API',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact (POST)'
    },
    status: 'operational'
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Skye Contact API running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`🌐 CORS enabled for production sites`);
});

//im so fucking tired lol
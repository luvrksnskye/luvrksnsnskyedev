const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Testing iCloud Email Configuration...\n');

// Display my configuration (hiding password)
console.log('Configuration:');
console.log('Email:', process.env.ICLOUD_EMAIL);
console.log('Password:', process.env.ICLOUD_APP_PASSWORD ? 
    process.env.ICLOUD_APP_PASSWORD.substring(0, 4) + '****' : 
    '❌ NOT SET');
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.me.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.ICLOUD_EMAIL,
        pass: process.env.ICLOUD_APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true, // Enable debug output
    logger: true // Log to console
});

// Test the connection
console.log('📡 Testing connection to iCloud SMTP server...\n');

transporter.verify(function(error, success) {
    if (error) {
        console.log('\n❌ CONNECTION FAILED!\n');
        console.log('Error:', error.message);
        console.log('\n🔧 Troubleshooting Steps:');
        console.log('1. Make sure you\'re using an APP-SPECIFIC password, not your regular iCloud password');
        console.log('2. Generate a new app password at: https://appleid.apple.com');
        console.log('3. Make sure two-factor authentication is enabled');
        console.log('4. Copy the password exactly as shown (with dashes): xxxx-xxxx-xxxx-xxxx');
        console.log('5. Make sure your .env file has no extra spaces or quotes');
        process.exit(1);
    } else {
        console.log('\n✅ CONNECTION SUCCESSFUL!');
        console.log('Your iCloud email is configured correctly.');
        console.log('\n📧 Sending test email...\n');
        
        // Send a test email
        const mailOptions = {
            from: process.env.ICLOUD_EMAIL,
            to: process.env.ICLOUD_EMAIL,
            subject: '✅ Test Email - Configuration Successful',
            text: 'If you received this email, your contact form backend is configured correctly!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                    <h2 style="color: #4CAF50;">✅ Success!</h2>
                    <p>Your iCloud email configuration is working correctly.</p>
                    <p>Your contact form backend is ready to send emails.</p>
                    <hr>
                    <p style="color: #666; font-size: 14px;">
                        This is a test email from your contact form backend.
                    </p>
                </div>
            `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('❌ Failed to send test email:', error.message);
                process.exit(1);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('Message ID:', info.messageId);
                console.log('\n🎉 Everything is working! Check your inbox.');
                process.exit(0);
            }
        });
    }
});
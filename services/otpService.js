const nodemailer = require('nodemailer');
const twilio = require('twilio');
const crypto = require('crypto');

// Email configuration (update with your SMTP details)
const emailTransporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Twilio configuration (update with your credentials)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

class OTPService {
  // Generate a 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate a secure random OTP
  generateSecureOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send OTP via email
  async sendEmailOTP(email, otp, userName = 'User') {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@rajasthansevaporter.gov.in',
        to: email,
        subject: '🔐 Verification Code - Rajasthan Seva Portal',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f8f9ff; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .otp-box { background: linear-gradient(135deg, #e3f2fd, #bbdefb); border: 2px dashed #2196f3; padding: 20px; margin: 20px 0; border-radius: 10px; }
            .otp-code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #1565c0; letter-spacing: 5px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .btn { background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 6px; text-decoration: none; display: inline-block; margin: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏛️ Rajasthan Seva Portal</h1>
              <p>Secure Verification Required</p>
            </div>
            <div class="content">
              <h2>Hello ${userName}! 👋</h2>
              <p>You requested a verification code to access your account or complete an action on the Rajasthan Seva Portal.</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #1565c0; font-weight: 600;">Your Verification Code:</p>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                • This code expires in <strong>10 minutes</strong><br>
                • Do not share this code with anyone<br>
                • If you didn't request this, please ignore this email
              </div>
              
              <p>Having trouble? <a href="#" class="btn">Contact Support</a></p>
            </div>
            <div class="footer">
              <p>© 2025 Government of Rajasthan | Seva Portal<br>
              This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
        `
      };

      const result = await emailTransporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email OTP Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send OTP via SMS
  async sendSMSOTP(phoneNumber, otp) {
    if (!twilioClient) {
      console.log('Twilio not configured, simulating SMS OTP...');
      // For development/testing without Twilio
      return { 
        success: true, 
        message: `SMS OTP would be sent to ${phoneNumber}: ${otp}`,
        sid: 'simulated-' + Date.now()
      };
    }

    try {
      // Ensure phone number is in international format
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : '+91' + phoneNumber;
      
      const message = await twilioClient.messages.create({
        body: `🔐 Rajasthan Seva Portal Verification Code: ${otp}. Valid for 10 minutes. Do not share with anyone. - Govt of Rajasthan`,
        from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
        to: formattedPhone
      });

      return { success: true, sid: message.sid };
    } catch (error) {
      console.error('SMS OTP Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify OTP
  verifyOTP(providedOTP, storedOTP, expiresAt) {
    const now = new Date();
    
    if (now > new Date(expiresAt)) {
      return { valid: false, reason: 'expired' };
    }
    
    if (providedOTP !== storedOTP) {
      return { valid: false, reason: 'invalid' };
    }
    
    return { valid: true };
  }

  // Send complaint notification
  async sendComplaintNotification(email, complaintId, status = 'registered') {
    try {
      const statusMessages = {
        'registered': 'Your complaint has been successfully registered!',
        'processing': 'Your complaint is now being processed.',
        'review': 'Your complaint is under review.',
        'resolved': 'Great news! Your complaint has been resolved.',
        'closed': 'Your complaint has been closed.'
      };

      const statusColors = {
        'registered': '#28a745',
        'processing': '#ffc107',
        'review': '#17a2b8',
        'resolved': '#28a745',
        'closed': '#6c757d'
      };

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@rajasthansevaporter.gov.in',
        to: email,
        subject: `📋 Complaint Update - ${complaintId}`,
        html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background: #f8f9ff; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center;">
              <h1>🏛️ Rajasthan Seva Portal</h1>
              <h2>Complaint Status Update</h2>
            </div>
            <div style="padding: 30px; text-align: center;">
              <div style="background: ${statusColors[status]}; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0;">${statusMessages[status]}</h3>
              </div>
              <p><strong>Complaint ID:</strong> ${complaintId}</p>
              <p><strong>Status:</strong> ${status.toUpperCase()}</p>
              <div style="margin: 20px 0;">
                <a href="#" style="background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Track Your Complaint</a>
              </div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>© 2025 Government of Rajasthan | This is an automated notification.</p>
            </div>
          </div>
        </body>
        </html>
        `
      };

      await emailTransporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Notification Email Error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new OTPService();

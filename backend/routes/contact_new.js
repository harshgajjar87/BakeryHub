const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send contact form email
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, to } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Email message
    const msg = {
      to: to || 'harshcakezone555@gmail.com', // Default to harshcakezone555@gmail.com
      from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B4513;">New Contact Form Submission</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-line;">${message}</p>
          </div>
          <p style="color: #6c757d; font-size: 12px;">This message was sent from the contact form on Harsh Cake Zone website.</p>
        </div>
      `
    };

    // Send email using SendGrid
    await sgMail.send(msg);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully!'
    });
  } catch (error) {
    console.error('Error sending contact form:', error);
    if (error.response) {
      console.error('SendGrid API error:', error.response.body);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again.'
    });
  }
});

module.exports = router;

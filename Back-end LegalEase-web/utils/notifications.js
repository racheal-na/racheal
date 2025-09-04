const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Needed for document notifications

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.log('Email transporter error:', error);
  } else {
    console.log('Email server is ready to take messages');
  }
});

// Send appointment reminder email
exports.sendAppointmentReminder = async (appointment) => {
  try {
    const mailOptions = {
      from: `Legal Ease Lite <${process.env.EMAIL_USER}>`,
      to: appointment.clientId.email,
      subject: `Reminder: Appointment for ${appointment.title}`,
      html: `
        <h2>Appointment Reminder</h2>
        <p>You have an upcoming appointment:</p>
        <p><strong>Title:</strong> ${appointment.title}</p>
        <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Description:</strong> ${appointment.description || 'N/A'}</p>
        <p><strong>Location:</strong> ${appointment.location}</p>
        ${appointment.meetingLink 
          ? `<p><strong>Meeting Link:</strong> <a href="${appointment.meetingLink}">Join Meeting</a></p>` 
          : ''
        }
        <br>
        <p>Please make sure to be on time.</p>
        <p>If you need to reschedule, please contact us as soon as possible.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Appointment reminder sent successfully');
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
  }
};

// Send notification to admin about new appointment request
exports.sendNewAppointmentNotification = async (appointment, lawyer) => {
  try {
    const mailOptions = {
      from: `Legal Ease Lite <${process.env.EMAIL_USER}>`,
      to: lawyer.email,
      subject: `New Appointment Request: ${appointment.title}`,
      html: `
        <h2>New Appointment Request</h2>
        <p>A client has requested a new appointment:</p>
        <p><strong>Title:</strong> ${appointment.title}</p>
        <p><strong>Client:</strong> ${appointment.clientId.name}</p>
        <p><strong>Requested Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
        <p><strong>Requested Time:</strong> ${appointment.time}</p>
        <p><strong>Description:</strong> ${appointment.description || 'N/A'}</p>
        <br>
        <p>Please log in to your admin dashboard to approve or modify this appointment.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('New appointment notification sent to admin');
  } catch (error) {
    console.error('Error sending new appointment notification:', error);
  }
};

// Create in-app notification
exports.createNotification = async (title, message, type, recipient, relatedEntity = null) => {
  try {
    const notification = await Notification.create({
      title,
      message,
      type,
      recipient,
      relatedEntity
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send document upload notification
exports.sendDocumentUploadNotification = async (document, caseItem, uploadedBy) => {
  try {
    const recipientId = uploadedBy.role === 'lawyer' ? caseItem.clientId : caseItem.lawyerId;
    
    const notification = await this.createNotification(
      'New Document Uploaded',
      `A new document "${document.name}" has been uploaded to your case "${caseItem.title}"`,
      'document',
      recipientId,
      { entityType: 'Case', entityId: caseItem._id }
    );
    
    // Also send email notification
    const recipient = uploadedBy.role === 'lawyer' ? 
      await User.findById(caseItem.clientId) : 
      await User.findById(caseItem.lawyerId);
    
    if (recipient && recipient.email) {
      const mailOptions = {
        from: `Legal Ease Lite <${process.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: `New Document: ${document.name}`,
        html: `
          <h2>New Document Uploaded</h2>
          <p>A new document has been uploaded to your case:</p>
          <p><strong>Document:</strong> ${document.name}</p>
          <p><strong>Case:</strong> ${caseItem.title}</p>
          <p><strong>Uploaded by:</strong> ${uploadedBy.name}</p>
          <br>
          <p>Please log in to your account to view the document.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }
    
    return notification;
  } catch (error) {
    console.error('Error sending document upload notification:', error);
    throw error;
  }
};

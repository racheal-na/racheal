const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Case = require('../models/Case');
const { catchAsync } = require('../middleware/Error');
const { createNotification, sendAppointmentConfirmation } = require('../utils/notifications');

// Get all appointments
exports.getAppointments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, upcoming } = req.query;
  const query = {};

  if (req.user.role === 'lawyer') query.lawyerId = req.user.id;
  else query.clientId = req.user.id;

  if (status && status !== 'all') query.status = status;
  if (upcoming === 'true') query.date = { $gte: new Date() };

  const appointments = await Appointment.find(query)
    .populate('lawyerId', 'name email phone')
    .populate('clientId', 'name email phone')
    .populate('caseId', 'title')
    .sort({ date: 1, time: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    count: appointments.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    appointments
  });
});

// Get upcoming appointments (next 7 days)
exports.getUpcomingAppointments = catchAsync(async (req, res) => {
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const query = {
    date: { $gte: today, $lte: sevenDaysFromNow },
    status: 'Scheduled'
  };

  if (req.user.role === 'lawyer') query.lawyerId = req.user.id;
  else query.clientId = req.user.id;

  const appointments = await Appointment.find(query)
    .populate('lawyerId', 'name email phone')
    .populate('clientId', 'name email phone')
    .populate('caseId', 'title')
    .sort({ date: 1, time: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments
  });
});

// Get single appointment
exports.getAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('lawyerId', 'name email phone')
    .populate('clientId', 'name email phone')
    .populate('caseId', 'title');

  if (!appointment)
    return res.status(404).json({ success: false, message: 'Appointment not found' });

  if (req.user.role === 'lawyer' && appointment.lawyerId._id.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not authorized' });

  if (req.user.role === 'client' && appointment.clientId._id.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not authorized' });

  res.status(200).json({ success: true, appointment });
});

// Create appointment
exports.createAppointment = catchAsync(async (req, res) => {
  const { title, description, date, time, clientId, caseId, location, meetingLink } = req.body;

  let lawyerUser;

  if (req.user.role === 'lawyer') lawyerUser = req.user;
  else {
    lawyerUser = await User.findOne({ role: 'lawyer', isActive: true });
    if (!lawyerUser) return res.status(400).json({ success: false, message: 'No available lawyer' });
  }

  const appointment = await Appointment.create({
    title,
    description,
    date,
    time,
    lawyerId: lawyerUser._id,
    clientId: req.user.role === 'lawyer' ? clientId : req.user.id,
    caseId,
    location,
    meetingLink,
    status: req.user.role === 'lawyer' ? 'Scheduled' : 'Pending'
  });

  await appointment.populate('lawyerId', 'name email phone').populate('clientId', 'name email phone').populate('caseId', 'title');

  // Send notifications
  if (req.user.role === 'lawyer') {
    await sendAppointmentConfirmation(appointment);
    await createNotification(
      'New Appointment Scheduled',
      `Your appointment "${title}" is scheduled for ${new Date(date).toLocaleDateString()} at ${time}`,
      'appointment',
      clientId,
      { entityType: 'Appointment', entityId: appointment._id }
    );
  } else {
    await createNotification(
      'New Appointment Request',
      `Client ${req.user.name} requested appointment "${title}" on ${new Date(date).toLocaleDateString()} at ${time}`,
      'appointment',
      lawyerUser._id,
      { entityType: 'Appointment', entityId: appointment._id }
    );
  }

  res.status(201).json({
    success: true,
    message: req.user.role === 'lawyer' ? 'Appointment created' : 'Appointment request submitted',
    appointment
  });
});

// Update appointment
exports.updateAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  if (
    (req.user.role === 'lawyer' && appointment.lawyerId.toString() !== req.user.id) ||
    (req.user.role === 'client' && appointment.clientId.toString() !== req.user.id)
  )
    return res.status(403).json({ success: false, message: 'Not authorized' });

  const allowedUpdates = ['title', 'description', 'date', 'time', 'location', 'meetingLink'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) appointment[field] = req.body[field];
  });

  // Clients can only update pending requests
  if (req.user.role === 'client' && appointment.status !== 'Pending')
    return res.status(403).json({ success: false, message: 'Can only update pending appointments' });

  await appointment.save();
  await appointment.populate('lawyerId', 'name email phone').populate('clientId', 'name email phone').populate('caseId', 'title');

  res.status(200).json({ success: true, message: 'Appointment updated', appointment });
});

// Update appointment status (admin only)
exports.updateAppointmentStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id)
    .populate('lawyerId', 'name email phone')
    .populate('clientId', 'name email phone');

  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  if (appointment.lawyerId._id.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

  appointment.status = status;
  await appointment.save();

  await createNotification(
    'Appointment Status Updated',
    `Your appointment "${appointment.title}" is now ${status}`,
    'appointment',
    appointment.clientId._id,
    { entityType: 'Appointment', entityId: appointment._id }
  );

  if (status === 'Scheduled') await sendAppointmentConfirmation(appointment);

  res.status(200).json({ success: true, message: `Appointment status updated to ${status}`, appointment });
});

// Delete appointment
exports.deleteAppointment = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  if (
    (req.user.role === 'lawyer' && appointment.lawyerId.toString() !== req.user.id) ||
    (req.user.role === 'client' && appointment.clientId.toString() !== req.user.id)
  )
    return res.status(403).json({ success: false, message: 'Not authorized' });

  await Appointment.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Appointment deleted' });
});

// Send appointment reminder
exports.sendReminder = catchAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('lawyerId', 'name email phone')
    .populate('clientId', 'name email phone');

  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  if (appointment.lawyerId._id.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

  await sendAppointmentConfirmation(appointment);

  res.status(200).json({ success: true, message: 'Appointment reminder sent' });
});

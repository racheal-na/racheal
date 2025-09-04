const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth'); // <-- import authorize
const { sendAppointmentReminder } = require('../utils/notifications');
const Appointment = require('../models/Appointment');

const router = express.Router();

router.use(protect); // all routes require auth

router.route('/')
  .get(getNotifications);

router.route('/read-all')
  .put(markAllAsRead);

router.route('/:id/read')
  .put(markAsRead);

router.post('/:id/send-reminder', authorize('lawyer'), async (req, res) => { // <-- removed extra protect
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('clientId')
      .populate('lawyerId'); // <-- you probably mean lawyerId/adminId
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    await sendAppointmentReminder(appointment);
    
    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});  

router.route('/:id')
  .delete(deleteNotification);

module.exports = router;


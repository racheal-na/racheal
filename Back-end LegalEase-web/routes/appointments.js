const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getUpcomingAppointments,
  sendReminder,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

const router = express.Router();

router.use(protect);

// CRUD routes
router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointment)
  .delete(deleteAppointment);

// Additional routes
router.route('/upcoming')
  .get(getUpcomingAppointments);

router.route('/:id/send-reminder')
  .post(authorize('lawyer'), sendReminder);

router.route('/:id/status')
  .patch(authorize('lawyer'), updateAppointmentStatus);

module.exports = router;

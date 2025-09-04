const express = require('express');
const {
  getConstitutions,
  getConstitution,
  createConstitution,
  updateConstitution,
  deleteConstitution
} = require('../controllers/constitutionController');
const { protect, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload'); // ← import multer middleware

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all constitutions or create a new one
router.route('/')
  .get(getConstitutions) 
  .post(
    authorize('lawyer', 'client'), 
    uploadDocument.single('file'),   // ← handle file upload
    createConstitution
  );

// Get, update, or delete a specific constitution by ID
router.route('/:id')
  .get(getConstitution) 
  .put(authorize('lawyer', 'client'), updateConstitution)
  .delete(authorize('lawyer', 'client'), deleteConstitution);

module.exports = router;


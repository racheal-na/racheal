const express = require('express');
const {
  uploadDocument,
  getDocuments,
  downloadDocument,
  uploadConstitution,
  getConstitutionDocuments,
  downloadConstitution
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadDocument: multerUpload, uploadConstitution: multerConstitution } = require('../middleware/upload');

const router = express.Router({ mergeParams: true });

// All routes are protected
router.use(protect);

// Case document routes
router.route('/')
  .get(getDocuments)
  .post(multerUpload.single('document'), uploadDocument);

router.route('/:id/download')
  .get(downloadDocument);

// Constitution routes
router.route('/constitution/upload')
  .post(authorize('lawyer'), multerConstitution.single('constitution'), uploadConstitution);

router.route('/constitution')
  .get(getConstitutionDocuments);

router.route('/constitution/:filename')
  .get(downloadConstitution);

module.exports = router;
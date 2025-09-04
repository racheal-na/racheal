const express = require('express');
const {
  getCases,
  getCase,
  createCase,
  updateCase,
  addDocument, // controller
  addNote,     // controller
  deleteCase
} = require('../controllers/caseController');

const { protect, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload'); // middleware

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(getCases)
  .post(authorize('lawyer'), createCase);

router.route('/:id')
  .get(getCase)
  .put(updateCase)
  .delete(authorize('lawyer'), deleteCase);

router.route('/:id/documents')
  .post(uploadDocument.single('document'), addDocument); // ensure both are functions

router.route('/:id/notes')
  .post(addNote); // ensure addNote is exported and a function

module.exports = router;

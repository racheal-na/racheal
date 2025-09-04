const Document = require('../models/Document');
const Case = require('../models/Case');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

// @desc    Upload a document to a case
// @route   POST /api/cases/:caseId/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { title, description } = req.body;

    // Check if case exists and user has access
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Check if user has access to this case
    if (req.user.userType === 'client' && caseItem.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.userType === 'lawyer' && caseItem.lawyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Create document record
    const document = new Document({
      title: title || req.file.originalname,
      description,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      case: caseId,
      uploadedBy: req.user.id
    });

    await document.save();

    // Add document to case
    caseItem.documents.push(document._id);
    await caseItem.save();

    // Create notification
    const recipient = req.user.userType === 'client' ? caseItem.lawyer : caseItem.client;
    await Notification.create({
      title: 'New Document Uploaded',
      message: `A new document "${document.title}" has been uploaded to case "${caseItem.title}".`,
      type: 'document',
      recipient,
      relatedEntity: document._id,
      onModel: 'Document'
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// @desc    Get all documents for a case
// @route   GET /api/cases/:caseId/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    const { caseId } = req.params;
    
    // Check if user has access to this case
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (req.user.userType === 'client' && caseItem.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.userType === 'lawyer' && caseItem.lawyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const documents = await Document.find({ case: caseId }).populate('uploadedBy', 'name');
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download a document
// @route   GET /api/documents/:id/download
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('case');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to this document
    const hasAccess = (
      document.uploadedBy.toString() === req.user.id ||
      (document.case.client.toString() === req.user.id) ||
      (document.case.lawyer.toString() === req.user.id)
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '..', document.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimetype);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload constitution document
// @route   POST /api/constitution/upload
// @access  Private (Lawyer only)
exports.uploadConstitution = async (req, res) => {
  try {
    // Check if user is a lawyer
    if (req.user.userType !== 'lawyer') {
      return res.status(403).json({ message: 'Only lawyers can upload constitution documents' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    res.json({ 
      message: 'Constitution document uploaded successfully',
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all constitution documents
// @route   GET /api/constitution
// @access  Private
exports.getConstitutionDocuments = async (req, res) => {
  try {
    const constitutionPath = path.join(__dirname, '..', 'uploads', 'constitution');
    
    fs.readdir(constitutionPath, (err, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error reading constitution directory' });
      }
      
      const pdfFiles = files.filter(file => file.endsWith('.pdf'));
      res.json(pdfFiles);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download constitution document
// @route   GET /api/constitution/:filename
// @access  Private
exports.downloadConstitution = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'constitution', filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, filename, (err) => {
        if (err) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
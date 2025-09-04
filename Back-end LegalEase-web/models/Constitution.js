const mongoose = require('mongoose');

const constitutionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  category: { 
    type: String, 
    enum: ['Criminal', 'Civil', 'Family', 'Corporate', 'General'],
    required: [true, 'Please provide a category']
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  isPublic: {
    type: Boolean,
    default: true
  }
});

// Indexes for better query performance
constitutionSchema.index({ category: 1 });
constitutionSchema.index({ uploadedBy: 1 });
constitutionSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Constitution', constitutionSchema);
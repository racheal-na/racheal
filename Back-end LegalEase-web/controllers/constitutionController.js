const Constitution = require('../models/Constitution');
const { catchAsync } = require('../middleware/Error');

// Get all constitutions (with optional category filter)
exports.getConstitutions = catchAsync(async (req, res) => {
  const { category, isPublic } = req.query;
  let query = {};

  if (category) query.category = category;
  if (isPublic !== undefined) query.isPublic = isPublic === 'true';

  const constitutions = await Constitution.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ uploadedAt: -1 });

  res.status(200).json({ success: true, count: constitutions.length, constitutions });
});

// Get a single constitution by ID
exports.getConstitution = catchAsync(async (req, res) => {
  const constitution = await Constitution.findById(req.params.id)
    .populate('uploadedBy', 'name email');

  if (!constitution) {
    return res.status(404).json({ success: false, message: 'Constitution not found' });
  }

  // Increment download count if requested
  if (req.query.increment === 'true') {
    constitution.downloadCount += 1;
    await constitution.save();
  }

  res.status(200).json({ success: true, constitution });
});

// Create a new constitution
exports.createConstitution = catchAsync(async (req, res) => {
  const { title, description, fileUrl, fileName, fileSize, category, isPublic } = req.body;

  const newConstitution = await Constitution.create({
    title,
    description,
    fileUrl,
    fileName,
    fileSize,
    category,
    uploadedBy: req.user._id,
    isPublic
  });

  res.status(201).json({ success: true, constitution: newConstitution });
});

// Update a constitution
exports.updateConstitution = catchAsync(async (req, res) => {
  const constitution = await Constitution.findById(req.params.id);

  if (!constitution) {
    return res.status(404).json({ success: false, message: 'Constitution not found' });
  }

  // Only uploader can update
  if (constitution.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const updates = req.body;
  Object.assign(constitution, updates);

  await constitution.save();
  res.status(200).json({ success: true, constitution });
});

// Delete a constitution
exports.deleteConstitution = catchAsync(async (req, res) => {
  const constitution = await Constitution.findById(req.params.id);

  if (!constitution) {
    return res.status(404).json({ success: false, message: 'Constitution not found' });
  }

  // Only uploader can delete
  if (constitution.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await constitution.remove();
  res.status(200).json({ success: true, message: 'Constitution deleted' });
});

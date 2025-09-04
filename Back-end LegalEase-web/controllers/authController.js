const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { catchAsync } = require("../middleware/Error");
const { createNotification } = require("../utils/notifications");

// Generate JWT token
const signToken = id => {
  console.log("jwt error",process.env.JWT_SECRET);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Create and send token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// ===================== SIGNUP =====================
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  // 🔍 Debugging: check what role is coming in the request
  console.log("Incoming role value:", role);

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  console.log("existing user", existingUser);

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email"
    });
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    role,   // <-- this is where the invalid "admin" role causes ValidationError
    phone
  });

  // Create welcome notification
  if (newUser.role === "client") {
    await createNotification(
      "Welcome to Legal Ease Lite",
      "Thank you for registering with Legal Ease Lite. You can now book appointments and manage your cases.",
      "system",
      newUser._id
    );
  }
  if (role === "admin") {
  return res.status(400).json({
    success: false,
    message: "You cannot register as an admin"
  });
}


  createSendToken(newUser, 201, res);
});


// ===================== LOGIN =====================
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password"
    });
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: "Incorrect email or password"
    });
  }

  // Check if user is active
  if (user.isActive === false) {
    return res.status(401).json({
      success: false,
      message: "Account has been deactivated. Please contact support."
    });
  }

  createSendToken(user, 200, res);
});

// ===================== GET CURRENT USER =====================
exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// ===================== UPDATE USER DETAILS =====================
exports.updateDetails = catchAsync(async (req, res, next) => {
  const filteredBody = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    user: updatedUser
  });
});

// ===================== UPDATE PASSWORD =====================
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect"
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  createSendToken(user, 200, res);
});

// ===================== FORGOT PASSWORD =====================
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No user found with that email"
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Instead of sending email, return reset URL in JSON
  const resetURL = `${req.protocol}://${req.get("host")}/api/auth/resetPassword/${resetToken}`;

  res.status(200).json({
    success: true,
    message: "Password reset token generated",
    resetURL
  });
});

// ===================== RESET PASSWORD =====================
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Token is invalid or expired"
    });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

// ===================== LOGOUT =====================
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,
    },
    avatar: {
      type:    String,
      default: '',
    },
    avatarPublicId: {
      type: String,
      default: '',
    },
    bio: {
      type:      String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default:   '',
    },
    country: {
      type:    String,
      default: '',
    },
    language: {
      type:    String,
      default: 'English',
    },
    travelInterests: {
      type:    [String],
      default: [],
    },
    preferences: {
      budget:    { type: String, enum: ['budget', 'mid-range', 'luxury'], default: 'mid-range' },
      travelStyle: { type: String, enum: ['solo', 'couple', 'family', 'group'], default: 'solo' },
      seasons:   { type: [String], default: [] },
    },
    isVerified: {
      type:    Boolean,
      default: false,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    resetPasswordToken:   String,
    resetPasswordExpire:  Date,
    passwordChangedAt:    Date,
    lastLogin:            Date,
    searchHistory: {
      type:    [String],
      default: [],
    },
    stats: {
      totalTrips:     { type: Number, default: 0 },
      totalReviews:   { type: Number, default: 0 },
      totalBookmarks: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─── Pre-save hook: hash password ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.passwordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// ─── Virtuals ────────────────────────────────────────────────────────────────

userSchema.virtual('avatarUrl').get(function () {
  if (this.avatar) return this.avatar;
  // Default Gravatar-style placeholder
  const name = encodeURIComponent(this.name || 'User');
  return `https://ui-avatars.com/api/?name=${name}&background=4f46e5&color=fff&size=200`;
});

const User = mongoose.model('User', userSchema);
module.exports = User;

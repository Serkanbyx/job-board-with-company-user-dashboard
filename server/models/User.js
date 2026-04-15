import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000; // 30 minutes

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ['candidate', 'company', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'candidate',
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Account security fields
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    passwordHistory: { type: [String], select: false },
    passwordChangedAt: { type: Date },
    tokenVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },

    // Candidate-specific fields
    title: {
      type: String,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    bio: {
      type: String,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
    skills: [String],
    experience: {
      type: String,
      enum: {
        values: ['entry', 'junior', 'mid', 'senior', 'lead', 'manager'],
        message: '{VALUE} is not a valid experience level',
      },
    },
    cvUrl: String,
    portfolioUrl: String,
    linkedinUrl: String,
    githubUrl: String,
    desiredSalary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    jobPreferences: {
      types: [String],
      locations: [String],
      remote: Boolean,
    },

    // Company-specific fields
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      required: [
        function () {
          return this.role === 'company';
        },
        'Company name is required for company accounts',
      ],
    },
    companyLogo: String,
    companyWebsite: String,
    companyLocation: {
      type: String,
      trim: true,
      maxlength: [100, 'Company location cannot exceed 100 characters'],
    },
    companySize: {
      type: String,
      enum: {
        values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        message: '{VALUE} is not a valid company size',
      },
    },
    companyAbout: {
      type: String,
      maxlength: [3000, 'Company about cannot exceed 3000 characters'],
    },
    companyIndustry: {
      type: String,
      enum: {
        values: [
          'technology',
          'finance',
          'healthcare',
          'education',
          'marketing',
          'retail',
          'manufacturing',
          'consulting',
          'media',
          'other',
        ],
        message: '{VALUE} is not a valid industry',
      },
    },
    companyFounded: Number,
    companySocials: {
      linkedin: String,
      twitter: String,
      facebook: String,
    },

    // Notification preferences
    notificationPrefs: {
      emailOnApplication: { type: Boolean, default: true },
      emailOnStatusChange: { type: Boolean, default: true },
      emailOnNewJob: { type: Boolean, default: false },
      inAppNotifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lockUntil: 1 });

// Virtuals
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Strip sensitive fields from JSON output
userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret.password;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    delete ret.passwordHistory;
    delete ret.tokenVersion;
    return ret;
  },
});

// Pre-save hook — Mongoose 9 compatible (no next parameter)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  if (this.passwordHistory === undefined) this.passwordHistory = [];
  if (this.password && !this.isNew) {
    const currentHash = this.password;
    this.passwordHistory = [currentHash, ...this.passwordHistory].slice(0, 5);
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = new Date();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isPasswordReused = async function (newPassword) {
  if (!this.passwordHistory || this.passwordHistory.length === 0) return false;

  for (const oldHash of this.passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, oldHash);
    if (isMatch) return true;
  }
  return false;
};

userSchema.methods.incrementLoginAttempts = async function () {
  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME_MS) };
  }

  await this.constructor.findByIdAndUpdate(this._id, updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  await this.constructor.findByIdAndUpdate(this._id, {
    $set: { loginAttempts: 0, lockUntil: null },
  });
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return changedTimestamp > jwtTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;

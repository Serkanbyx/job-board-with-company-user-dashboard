import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    requirements: {
      type: String,
      maxlength: [5000, 'Requirements cannot exceed 5000 characters'],
    },
    responsibilities: {
      type: String,
      maxlength: [5000, 'Responsibilities cannot exceed 5000 characters'],
    },
    benefits: {
      type: String,
      maxlength: [3000, 'Benefits cannot exceed 3000 characters'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company reference is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Job type is required'],
      enum: {
        values: ['full-time', 'part-time', 'remote', 'contract', 'internship', 'hybrid'],
        message: '{VALUE} is not a valid job type',
      },
    },
    salary: {
      min: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative'],
      },
      max: Number,
      currency: {
        type: String,
        default: 'USD',
      },
      period: {
        type: String,
        enum: {
          values: ['hourly', 'monthly', 'yearly'],
          message: '{VALUE} is not a valid salary period',
        },
        default: 'monthly',
      },
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: [
        {
          validator: (val) => val.length >= 1,
          message: 'At least one skill is required',
        },
        {
          validator: (val) => val.length <= 15,
          message: 'Cannot have more than 15 skills',
        },
      ],
    },
    experience: {
      type: String,
      enum: {
        values: ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'any'],
        message: '{VALUE} is not a valid experience level',
      },
      default: 'any',
    },
    education: {
      type: String,
      enum: {
        values: ['none', 'high-school', 'associate', 'bachelor', 'master', 'doctorate', 'any'],
        message: '{VALUE} is not a valid education level',
      },
      default: 'any',
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
    },
    positions: {
      type: Number,
      min: [1, 'At least 1 position is required'],
      default: 1,
    },
    deadline: {
      type: Date,
      validate: {
        validator: function (val) {
          if (!val) return true;
          return val > new Date();
        },
        message: 'Deadline must be a future date',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
jobSchema.index({ slug: 1 }, { unique: true });
jobSchema.index({ company: 1, createdAt: -1 });
jobSchema.index({ type: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ isActive: 1, createdAt: -1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ isFeatured: -1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

// Pre-save hook — generate slug from title (Mongoose 9 compatible)
jobSchema.pre('save', async function () {
  if (!this.isModified('title')) return;

  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = Date.now().toString(36).slice(-5);
  this.slug = `${baseSlug}-${suffix}`;
});

const Job = mongoose.model('Job', jobSchema);

export default Job;

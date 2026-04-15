import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Company reference is required'],
    },
    cvUrl: {
      type: String,
      required: [true, 'CV URL is required'],
    },
    coverLetter: {
      type: String,
      maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
    },
    expectedSalary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    availableFrom: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'reviewed',
          'shortlisted',
          'interviewed',
          'offered',
          'hired',
          'rejected',
          'withdrawn',
        ],
        message: '{VALUE} is not a valid application status',
      },
      default: 'pending',
    },
    statusNote: {
      type: String,
      maxlength: [1000, 'Status note cannot exceed 1000 characters'],
    },
    statusHistory: [
      {
        status: String,
        note: String,
        changedAt: Date,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    internalNotes: {
      type: String,
      maxlength: [2000, 'Internal notes cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, createdAt: -1 });
applicationSchema.index({ company: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

// Pre-save hook — initialize statusHistory for new applications (Mongoose 9 compatible)
applicationSchema.pre('save', async function () {
  if (this.isNew) {
    this.statusHistory = [
      {
        status: 'pending',
        changedAt: new Date(),
        changedBy: this.candidate,
      },
    ];
  }
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;

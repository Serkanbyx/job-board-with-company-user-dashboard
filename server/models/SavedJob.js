import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
  },
  { timestamps: true }
);

// Compound unique — prevent duplicate saves
savedJobSchema.index({ candidate: 1, job: 1 }, { unique: true });

// Listing saved jobs by date
savedJobSchema.index({ candidate: 1, createdAt: -1 });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

export default SavedJob;

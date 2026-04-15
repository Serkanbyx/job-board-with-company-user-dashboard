import mongoose from 'mongoose';
import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

/**
 * @desc    Toggle save/unsave a job (bookmark)
 * @route   POST /api/saved-jobs/:jobId
 * @access  Candidate only
 */
export const toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return sendError(res, 400, 'Invalid job ID.');
    }

    const job = await Job.findOne({ _id: jobId, isActive: true });

    if (!job) {
      return sendError(res, 404, 'Job not found or no longer active.');
    }

    const existingSave = await SavedJob.findOne({
      candidate: req.user._id,
      job: jobId,
    });

    if (existingSave) {
      await SavedJob.findByIdAndDelete(existingSave._id);
      return sendSuccess(res, 200, { saved: false }, 'Job removed from saved');
    }

    await SavedJob.create({ candidate: req.user._id, job: jobId });

    sendSuccess(res, 200, { saved: true }, 'Job saved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all saved jobs for the logged-in candidate
 * @route   GET /api/saved-jobs
 * @access  Candidate only
 */
export const getMySavedJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = { candidate: req.user._id };

    const [savedJobs, total] = await Promise.all([
      SavedJob.find(filter)
        .populate({
          path: 'job',
          select:
            'title slug location type salary skills deadline isActive company createdAt',
          populate: {
            path: 'company',
            select: 'companyName companyLogo',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SavedJob.countDocuments(filter),
    ]);

    // Filter out orphaned saves (deleted jobs)
    const validSavedJobs = savedJobs.filter((s) => s.job !== null);

    // Clean up orphaned records in the background
    const orphanedIds = savedJobs
      .filter((s) => s.job === null)
      .map((s) => s._id);

    if (orphanedIds.length > 0) {
      SavedJob.deleteMany({ _id: { $in: orphanedIds } }).catch(() => {});
    }

    const totalPages = Math.ceil(total / limit);

    sendPaginated(res, validSavedJobs, {
      page,
      totalPages,
      total,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Batch check if specific jobs are saved by the candidate
 * @route   GET /api/saved-jobs/check
 * @access  Candidate only
 */
export const checkSavedStatus = async (req, res, next) => {
  try {
    const { jobIds } = req.query;

    if (!jobIds) {
      return sendError(res, 400, 'jobIds query parameter is required.');
    }

    const ids = jobIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (ids.length === 0) {
      return sendSuccess(res, 200, {}, 'Saved status checked');
    }

    const savedRecords = await SavedJob.find({
      candidate: req.user._id,
      job: { $in: ids },
    }).select('job');

    const savedSet = new Set(savedRecords.map((s) => s.job.toString()));

    const statusMap = {};
    for (const id of ids) {
      statusMap[id] = savedSet.has(id);
    }

    sendSuccess(res, 200, statusMap, 'Saved status checked');
  } catch (error) {
    next(error);
  }
};

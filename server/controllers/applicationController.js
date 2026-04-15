import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

const APPLICATION_ALLOWED_FIELDS = ['cvUrl', 'coverLetter', 'expectedSalary', 'availableFrom'];

/**
 * State machine for application status transitions.
 * Terminal states (hired, rejected, withdrawn) have no outgoing transitions.
 */
const STATUS_TRANSITIONS = {
  pending: ['reviewed', 'rejected'],
  reviewed: ['shortlisted', 'rejected'],
  shortlisted: ['interviewed', 'rejected'],
  interviewed: ['offered', 'rejected'],
  offered: ['hired', 'rejected'],
  hired: [],
  rejected: [],
  withdrawn: [],
};

const CANDIDATE_EXCLUDED_FIELDS = '-internalNotes -rating';

const JOB_POPULATE_FIELDS = 'title slug location type isActive company salary deadline';

const CANDIDATE_POPULATE_FIELDS =
  'firstName lastName email title avatar skills experience location phone linkedinUrl githubUrl portfolioUrl';

/**
 * Picks only allowed fields from the request body.
 */
const pickFields = (body, fields) => {
  const result = {};
  for (const field of fields) {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }
  }
  return result;
};

/**
 * @desc    Apply to a job
 * @route   POST /api/jobs/:jobId/apply
 * @access  Candidate only
 */
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    if (!job.isActive) {
      return sendError(res, 400, 'This job is no longer accepting applications.');
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return sendError(res, 400, 'Application deadline has passed.');
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });
    if (existingApplication) {
      return sendError(res, 409, 'You have already applied to this job.');
    }

    const data = pickFields(req.body, APPLICATION_ALLOWED_FIELDS);
    data.candidate = req.user._id;
    data.job = jobId;
    data.company = job.company;

    const application = await Application.create(data);

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // TODO: Trigger notification for the company (Step 11)

    sendSuccess(res, 201, { application }, 'Application submitted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for the logged-in candidate
 * @route   GET /api/applications/mine
 * @access  Candidate only
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { candidate: req.user._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .select(CANDIDATE_EXCLUDED_FIELDS)
        .populate({
          path: 'job',
          select: JOB_POPULATE_FIELDS,
          populate: {
            path: 'company',
            select: 'companyName companyLogo',
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    sendPaginated(res, applications, { page, totalPages, total, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for a specific job
 * @route   GET /api/jobs/:jobId/applications
 * @access  Company only (job owner) or Admin
 */
export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    if (
      job.company.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 403, "You don't have permission to view these applications.");
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { job: jobId };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.rating) {
      filter.rating = { $gte: parseInt(req.query.rating, 10) };
    }

    let query = Application.find(filter)
      .populate('candidate', CANDIDATE_POPULATE_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Candidate name search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');

      const matchingApplications = await Application.find(filter)
        .populate('candidate', CANDIDATE_POPULATE_FIELDS)
        .sort({ createdAt: -1 });

      const filtered = matchingApplications.filter((app) => {
        const candidate = app.candidate;
        if (!candidate) return false;
        const fullName = `${candidate.firstName} ${candidate.lastName}`;
        return searchRegex.test(fullName) || searchRegex.test(candidate.email);
      });

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = filtered.slice(skip, skip + limit);

      return sendPaginated(res, paginated, { page, totalPages, total, limit });
    }

    const [applications, total] = await Promise.all([
      query,
      Application.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    sendPaginated(res, applications, { page, totalPages, total, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single application by ID
 * @route   GET /api/applications/:id
 * @access  Job owner, applicant, or admin
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        select: JOB_POPULATE_FIELDS,
        populate: {
          path: 'company',
          select: 'companyName companyLogo',
        },
      })
      .populate('candidate', CANDIDATE_POPULATE_FIELDS);

    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    const isCandidate = application.candidate._id.toString() === req.user._id.toString();
    const isCompany = application.company.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCandidate && !isCompany && !isAdmin) {
      return sendError(res, 403, "You don't have permission to view this application.");
    }

    // Strip company-private fields from candidate responses
    if (isCandidate) {
      const appObj = application.toObject();
      delete appObj.internalNotes;
      delete appObj.rating;
      return sendSuccess(res, 200, { application: appObj }, 'Application retrieved successfully');
    }

    sendSuccess(res, 200, { application }, 'Application retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw an application
 * @route   DELETE /api/applications/:id
 * @access  Candidate only (applicant)
 */
export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "You don't have permission to withdraw this application.");
    }

    const withdrawableStatuses = ['pending', 'reviewed', 'shortlisted'];
    if (!withdrawableStatuses.includes(application.status)) {
      return sendError(
        res,
        400,
        `Cannot withdraw application with status "${application.status}". Only pending, reviewed, or shortlisted applications can be withdrawn.`
      );
    }

    application.status = 'withdrawn';
    application.statusHistory.push({
      status: 'withdrawn',
      changedAt: new Date(),
      changedBy: req.user._id,
    });
    await application.save();

    await Job.findByIdAndUpdate(application.job, { $inc: { applicationCount: -1 } });

    sendSuccess(res, 200, { application }, 'Application withdrawn successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status with state machine validation
 * @route   PATCH /api/applications/:id/status
 * @access  Company only (job owner) or Admin
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'company');

    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    const isJobOwner = application.job.company.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isJobOwner && !isAdmin) {
      return sendError(res, 403, "You don't have permission to update this application.");
    }

    const { status, statusNote } = req.body;

    if (!status) {
      return sendError(res, 400, 'Status is required.');
    }

    const currentStatus = application.status;
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(status)) {
      return sendError(
        res,
        400,
        `Cannot change status from '${currentStatus}' to '${status}'. Allowed transitions: [${allowedTransitions.join(', ')}]`
      );
    }

    if (statusNote && statusNote.length > 1000) {
      return sendError(res, 400, 'Status note cannot exceed 1000 characters.');
    }

    application.status = status;
    application.statusHistory.push({
      status,
      note: statusNote || undefined,
      changedAt: new Date(),
      changedBy: req.user._id,
    });

    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate({
        path: 'job',
        select: JOB_POPULATE_FIELDS,
        populate: { path: 'company', select: 'companyName companyLogo' },
      })
      .populate('candidate', CANDIDATE_POPULATE_FIELDS);

    // TODO: Trigger notification for the candidate (Step 11)

    sendSuccess(res, 200, { application: populatedApplication }, 'Application status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update internal notes and rating for an application
 * @route   PATCH /api/applications/:id/notes
 * @access  Company only (job owner) or Admin
 */
export const updateInternalNotes = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'company');

    if (!application) {
      return sendError(res, 404, 'Application not found.');
    }

    const isJobOwner = application.job.company.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isJobOwner && !isAdmin) {
      return sendError(res, 403, "You don't have permission to update this application.");
    }

    const { internalNotes, rating } = req.body;

    if (internalNotes !== undefined) {
      if (internalNotes.length > 2000) {
        return sendError(res, 400, 'Internal notes cannot exceed 2000 characters.');
      }
      application.internalNotes = internalNotes;
    }

    if (rating !== undefined) {
      const parsedRating = parseInt(rating, 10);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return sendError(res, 400, 'Rating must be an integer between 1 and 5.');
      }
      application.rating = parsedRating;
    }

    await application.save();

    sendSuccess(res, 200, { application }, 'Internal notes updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get application statistics for a specific job
 * @route   GET /api/jobs/:jobId/applications/stats
 * @access  Company only (job owner) or Admin
 */
export const getApplicationStats = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    const isJobOwner = job.company.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isJobOwner && !isAdmin) {
      return sendError(res, 403, "You don't have permission to view these statistics.");
    }

    const jobObjectId = new mongoose.Types.ObjectId(jobId);

    const [statusCounts, ratingStats, latestApplication] = await Promise.all([
      Application.aggregate([
        { $match: { job: jobObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { job: jobObjectId, rating: { $ne: null } } },
        { $group: { _id: null, averageRating: { $avg: '$rating' }, ratedCount: { $sum: 1 } } },
      ]),
      Application.findOne({ job: jobId }).sort({ createdAt: -1 }).select('createdAt').lean(),
    ]);

    const statusBreakdown = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interviewed: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
      withdrawn: 0,
    };

    let total = 0;
    for (const entry of statusCounts) {
      statusBreakdown[entry._id] = entry.count;
      total += entry.count;
    }

    const stats = {
      statusBreakdown,
      total,
      averageRating: ratingStats[0]?.averageRating ? Math.round(ratingStats[0].averageRating * 100) / 100 : null,
      ratedCount: ratingStats[0]?.ratedCount || 0,
      lastApplicationDate: latestApplication?.createdAt || null,
    };

    sendSuccess(res, 200, { stats }, 'Application statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk update multiple application statuses
 * @route   PATCH /api/applications/bulk-status
 * @access  Company only
 */
export const bulkUpdateStatus = async (req, res, next) => {
  try {
    const { applicationIds, status, statusNote } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return sendError(res, 400, 'applicationIds must be a non-empty array.');
    }

    if (!status) {
      return sendError(res, 400, 'Status is required.');
    }

    if (statusNote && statusNote.length > 1000) {
      return sendError(res, 400, 'Status note cannot exceed 1000 characters.');
    }

    const applications = await Application.find({
      _id: { $in: applicationIds },
    }).populate('job', 'company');

    const results = { updated: 0, skipped: 0, errors: [] };

    const updatePromises = [];

    for (const app of applications) {
      const isJobOwner = app.job.company.toString() === req.user._id.toString();

      if (!isJobOwner) {
        results.skipped++;
        results.errors.push({ id: app._id, reason: 'You do not own this job.' });
        continue;
      }

      const allowedTransitions = STATUS_TRANSITIONS[app.status] || [];
      if (!allowedTransitions.includes(status)) {
        results.skipped++;
        results.errors.push({
          id: app._id,
          reason: `Cannot change status from '${app.status}' to '${status}'. Allowed: [${allowedTransitions.join(', ')}]`,
        });
        continue;
      }

      app.status = status;
      app.statusHistory.push({
        status,
        note: statusNote || undefined,
        changedAt: new Date(),
        changedBy: req.user._id,
      });

      updatePromises.push(app.save());
      results.updated++;
    }

    // Track IDs that were not found in DB
    const foundIds = new Set(applications.map((a) => a._id.toString()));
    for (const id of applicationIds) {
      if (!foundIds.has(id)) {
        results.skipped++;
        results.errors.push({ id, reason: 'Application not found.' });
      }
    }

    await Promise.all(updatePromises);

    sendSuccess(res, 200, results, 'Bulk status update completed');
  } catch (error) {
    next(error);
  }
};

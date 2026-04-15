import Job from '../models/Job.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

const JOB_WRITABLE_FIELDS = [
  'title',
  'description',
  'requirements',
  'responsibilities',
  'benefits',
  'location',
  'type',
  'salary',
  'skills',
  'experience',
  'education',
  'department',
  'positions',
  'deadline',
];

const COMPANY_POPULATE_FIELDS =
  'companyName companyLogo companyLocation companyIndustry firstName lastName';

const COMPANY_POPULATE_FULL =
  'companyName companyLogo companyWebsite companyLocation companySize companyAbout companyIndustry companyFounded companySocials firstName lastName avatar';

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
 * @desc    Create a new job listing
 * @route   POST /api/jobs
 * @access  Company only
 */
export const createJob = async (req, res, next) => {
  try {
    const data = pickFields(req.body, JOB_WRITABLE_FIELDS);
    data.company = req.user._id;

    if (data.salary && data.salary.min != null && data.salary.max != null) {
      if (data.salary.max < data.salary.min) {
        return sendError(res, 400, 'Maximum salary must be greater than or equal to minimum salary.');
      }
    }

    if (data.deadline && new Date(data.deadline) <= new Date()) {
      return sendError(res, 400, 'Deadline must be a future date.');
    }

    const job = await Job.create(data);

    const populatedJob = await Job.findById(job._id).populate(
      'company',
      COMPANY_POPULATE_FIELDS
    );

    sendSuccess(res, 201, { job: populatedJob }, 'Job created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active jobs (public listing with pagination)
 * @route   GET /api/jobs
 * @access  Public
 */
export const getAllJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('company', COMPANY_POPULATE_FIELDS)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    sendPaginated(res, jobs, { page, totalPages, total, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single job by slug (increments views for non-owners)
 * @route   GET /api/jobs/:slug
 * @access  Public (optionalAuth)
 */
export const getJobBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const job = await Job.findOne({ slug }).populate('company', COMPANY_POPULATE_FULL);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    const isOwner =
      req.user && job.company._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!job.isActive && !isOwner && !isAdmin) {
      return sendError(res, 404, 'Job not found.');
    }

    // Increment views atomically — only for non-owner views
    if (!isOwner) {
      await Job.findOneAndUpdate({ slug }, { $inc: { views: 1 } });
    }

    sendSuccess(res, 200, { job }, 'Job retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get jobs posted by the logged-in company
 * @route   GET /api/jobs/my-jobs
 * @access  Company only
 */
export const getMyJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = { company: req.user._id };

    if (req.query.status === 'active') {
      filter.isActive = true;
    } else if (req.query.status === 'inactive') {
      filter.isActive = false;
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    sendPaginated(res, jobs, { page, totalPages, total, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job listing
 * @route   PUT /api/jobs/:id
 * @access  Company only (owner) or Admin
 */
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    if (
      job.company.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 403, "You don't have permission to update this job.");
    }

    const updates = pickFields(req.body, JOB_WRITABLE_FIELDS);

    if (updates.salary && updates.salary.min != null && updates.salary.max != null) {
      if (updates.salary.max < updates.salary.min) {
        return sendError(res, 400, 'Maximum salary must be greater than or equal to minimum salary.');
      }
    }

    if (updates.deadline && new Date(updates.deadline) <= new Date()) {
      return sendError(res, 400, 'Deadline must be a future date.');
    }

    Object.assign(job, updates);
    await job.save();

    const updatedJob = await Job.findById(job._id).populate(
      'company',
      COMPANY_POPULATE_FIELDS
    );

    sendSuccess(res, 200, { job: updatedJob }, 'Job updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job listing with cascade
 * @route   DELETE /api/jobs/:id
 * @access  Company only (owner) or Admin
 */
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    if (
      job.company.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return sendError(res, 403, "You don't have permission to delete this job.");
    }

    // Cascade delete dependent data (models may not exist yet)
    try {
      const Application = (await import('../models/Application.js')).default;
      await Application.deleteMany({ job: job._id });
    } catch { /* Model not yet created */ }

    try {
      const SavedJob = (await import('../models/SavedJob.js')).default;
      await SavedJob.deleteMany({ job: job._id });
    } catch { /* Model not yet created */ }

    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.deleteMany({ job: job._id });
    } catch { /* Model not yet created */ }

    await Job.findByIdAndDelete(job._id);

    sendSuccess(res, 200, null, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle job active status
 * @route   PATCH /api/jobs/:id/toggle
 * @access  Company only (owner)
 */
export const toggleJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    if (job.company.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "You don't have permission to toggle this job.");
    }

    job.isActive = !job.isActive;
    await job.save();

    sendSuccess(
      res,
      200,
      { job },
      `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get similar jobs based on skills, type, or location
 * @route   GET /api/jobs/:slug/similar
 * @access  Public
 */
export const getSimilarJobs = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const targetJob = await Job.findOne({ slug });

    if (!targetJob) {
      return sendError(res, 404, 'Job not found.');
    }

    const similarJobs = await Job.aggregate([
      {
        $match: {
          _id: { $ne: targetJob._id },
          isActive: true,
          $or: [
            { skills: { $in: targetJob.skills } },
            { type: targetJob.type },
            { location: targetJob.location },
          ],
        },
      },
      {
        $addFields: {
          matchingSkills: {
            $size: {
              $setIntersection: ['$skills', targetJob.skills],
            },
          },
        },
      },
      { $sort: { matchingSkills: -1, isFeatured: -1, createdAt: -1 } },
      { $limit: 4 },
    ]);

    // Populate company info on aggregation results
    const populatedJobs = await Job.populate(similarJobs, {
      path: 'company',
      select: COMPANY_POPULATE_FIELDS,
    });

    sendSuccess(res, 200, { jobs: populatedJobs }, 'Similar jobs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

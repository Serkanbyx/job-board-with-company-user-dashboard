import mongoose from 'mongoose';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import escapeRegex from '../utils/escapeRegex.js';
import createNotification from '../utils/createNotification.js';

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

// Valid enum values for filter validation
const VALID_EXPERIENCE = ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'any'];
const VALID_EDUCATION = ['none', 'high-school', 'associate', 'bachelor', 'master', 'doctorate', 'any'];

const SORT_OPTIONS = {
  newest: { isFeatured: -1, createdAt: -1 },
  oldest: { createdAt: 1 },
  'salary-high': { 'salary.max': -1, createdAt: -1 },
  'salary-low': { 'salary.min': 1, createdAt: -1 },
  deadline: { deadline: 1, createdAt: -1 },
  'most-applied': { applicationCount: -1, createdAt: -1 },
  'most-viewed': { views: -1, createdAt: -1 },
};

/**
 * Calculates a date threshold from a duration string (24h, 7d, 30d).
 */
const getPostedWithinThreshold = (value) => {
  const now = new Date();
  const match = value.match(/^(\d+)(h|d)$/);
  if (!match) return null;

  const amount = parseInt(match[1], 10);
  const unit = match[2];

  if (unit === 'h') return new Date(now.getTime() - amount * 60 * 60 * 1000);
  if (unit === 'd') return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
  return null;
};

/**
 * @desc    Get all active jobs (public listing with advanced filters, search & pagination)
 * @route   GET /api/jobs
 * @access  Public
 */
export const getAllJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    // Full-text search on title and description
    if (req.query.search) {
      const escaped = escapeRegex(req.query.search.trim());
      filter.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    // Job type filter (comma-separated support)
    if (req.query.type) {
      const types = req.query.type.split(',').map((t) => t.trim().toLowerCase());
      filter.type = { $in: types };
    }

    // Location filter (partial match)
    if (req.query.location) {
      const escaped = escapeRegex(req.query.location.trim());
      filter.location = { $regex: escaped, $options: 'i' };
    }

    // Skills filter (comma-separated, case-insensitive)
    if (req.query.skill) {
      const skillRegexes = req.query.skill
        .split(',')
        .map((s) => new RegExp(`^${escapeRegex(s.trim())}$`, 'i'));
      filter.skills = { $in: skillRegexes };
    }

    // Salary range filters
    if (req.query.salaryMin) {
      const salaryMin = parseFloat(req.query.salaryMin);
      if (!isNaN(salaryMin)) filter['salary.min'] = { $gte: salaryMin };
    }

    if (req.query.salaryMax) {
      const salaryMax = parseFloat(req.query.salaryMax);
      if (!isNaN(salaryMax)) filter['salary.max'] = { $lte: salaryMax };
    }

    // Experience level filter (enum validation)
    if (req.query.experience && VALID_EXPERIENCE.includes(req.query.experience)) {
      filter.experience = req.query.experience;
    }

    // Education level filter (enum validation)
    if (req.query.education && VALID_EDUCATION.includes(req.query.education)) {
      filter.education = req.query.education;
    }

    // Industry filter (requires User lookup for companyIndustry)
    if (req.query.industry) {
      const companyUsers = await User.find(
        { role: 'company', companyIndustry: req.query.industry },
        '_id'
      );
      const companyIds = companyUsers.map((u) => u._id);
      filter.company = { $in: companyIds };
    }

    // Featured filter
    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    // Has deadline (future deadline) filter
    if (req.query.hasDeadline === 'true') {
      filter.deadline = { $gte: new Date() };
    }

    // Posted within filter (24h, 7d, 30d)
    if (req.query.postedWithin) {
      const threshold = getPostedWithinThreshold(req.query.postedWithin);
      if (threshold) filter.createdAt = { $gte: threshold };
    }

    // Sort — validate against allowed list, default to newest
    const sortKey = SORT_OPTIONS[req.query.sort] ? req.query.sort : 'newest';
    const sortOption = SORT_OPTIONS[sortKey];

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('company', COMPANY_POPULATE_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    sendPaginated(res, jobs, {
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
 * @desc    Get aggregate job statistics for filter UI
 * @route   GET /api/jobs/stats
 * @access  Public
 */
export const getJobStats = async (req, res, next) => {
  try {
    const baseFilter = { isActive: true };

    const [
      totalJobs,
      typeCounts,
      experienceCounts,
      topLocations,
      topSkills,
      salaryRange,
    ] = await Promise.all([
      Job.countDocuments(baseFilter),

      Job.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Job.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$experience', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Job.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Job.aggregate([
        { $match: baseFilter },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),

      Job.aggregate([
        { $match: { ...baseFilter, 'salary.min': { $exists: true } } },
        {
          $group: {
            _id: null,
            minSalary: { $min: '$salary.min' },
            maxSalary: { $max: '$salary.max' },
          },
        },
      ]),
    ]);

    const formatCounts = (arr) =>
      arr.reduce((acc, { _id, count }) => {
        if (_id) acc[_id] = count;
        return acc;
      }, {});

    sendSuccess(res, 200, {
      totalJobs,
      byType: formatCounts(typeCounts),
      byExperience: formatCounts(experienceCounts),
      topLocations: topLocations.map(({ _id, count }) => ({ location: _id, count })),
      topSkills: topSkills.map(({ _id, count }) => ({ skill: _id, count })),
      salaryRange: salaryRange[0]
        ? { min: salaryRange[0].minSalary, max: salaryRange[0].maxSalary }
        : { min: 0, max: 0 },
    }, 'Job statistics retrieved successfully');
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

    // Accept either a slug or a Mongo ObjectId so legacy/missing-slug jobs stay reachable
    const lookup = mongoose.isValidObjectId(slug)
      ? { $or: [{ slug }, { _id: slug }] }
      : { slug };

    const job = await Job.findOne(lookup).populate('company', COMPANY_POPULATE_FULL);

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
      await Job.findByIdAndUpdate(job._id, { $inc: { views: 1 } });
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

    const [jobs, total, totalJobs, activeJobs] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
      Job.countDocuments({ company: req.user._id }),
      Job.countDocuments({ company: req.user._id, isActive: true }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: { page, totalPages, total, limit },
      totalJobs,
      activeJobs,
      inactiveJobs: totalJobs - activeJobs,
    });
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
      await Notification.deleteMany({ relatedJob: job._id });
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

    const wasActive = job.isActive;
    job.isActive = !job.isActive;
    await job.save();

    // Notify candidates when a job is deactivated
    if (wasActive && !job.isActive) {
      const activeStatuses = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered'];
      const affectedApplications = await Application.find({
        job: job._id,
        status: { $in: activeStatuses },
      }).select('candidate');

      const notificationPromises = affectedApplications.map((app) =>
        createNotification({
          recipient: app.candidate,
          sender: req.user._id,
          type: 'job_deactivated',
          title: 'Job No Longer Active',
          message: `The position ${job.title} is no longer accepting applications`,
          link: '/candidate/applications',
          relatedJob: job._id,
          relatedApplication: app._id,
        })
      );
      Promise.all(notificationPromises).catch(() => {});
    }

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

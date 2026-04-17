import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';
import escapeRegex from '../utils/escapeRegex.js';
import createNotification from '../utils/createNotification.js';

/**
 * @desc    Get platform-wide admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Admin only
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalCandidates,
      totalCompanies,
      activeUsers,
      inactiveUsers,
      totalJobs,
      activeJobs,
      inactiveJobs,
      featuredJobs,
      totalApplications,
      applicationsByStatus,
      recentUsers,
      recentJobs,
      todayUsers,
      todayJobs,
      todayApplications,
      prevPeriodUsers,
      prevPeriodJobs,
      prevPeriodApplications,
      currentPeriodUsers,
      currentPeriodJobs,
      currentPeriodApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'company' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Job.countDocuments({ isActive: false }),
      Job.countDocuments({ isFeatured: true }),
      Application.countDocuments(),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName role email createdAt'),
      Job.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title type createdAt')
        .populate('company', 'companyName'),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      Job.countDocuments({ createdAt: { $gte: todayStart } }),
      Application.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Job.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Application.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Job.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Application.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    const calcGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    const statusMap = applicationsByStatus.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    sendSuccess(res, 200, {
      totalUsers,
      totalCandidates,
      totalCompanies,
      activeUsers,
      inactiveUsers,
      totalJobs,
      activeJobs,
      inactiveJobs,
      featuredJobs,
      totalApplications,
      applicationsByStatus: statusMap,
      recentUsers,
      recentJobs,
      todayStats: {
        users: todayUsers,
        jobs: todayJobs,
        applications: todayApplications,
      },
      growthRate: {
        users: calcGrowth(currentPeriodUsers, prevPeriodUsers),
        jobs: calcGrowth(currentPeriodJobs, prevPeriodJobs),
        applications: calcGrowth(currentPeriodApplications, prevPeriodApplications),
      },
    }, 'Admin dashboard data retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with filters, search, pagination & sorting
 * @route   GET /api/admin/users
 * @access  Admin only
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      const escaped = escapeRegex(req.query.search.trim());
      filter.$or = [
        { firstName: { $regex: escaped, $options: 'i' } },
        { lastName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { companyName: { $regex: escaped, $options: 'i' } },
      ];
    }

    const SORT_OPTIONS = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'name-asc': { firstName: 1, lastName: 1 },
      'name-desc': { firstName: -1, lastName: -1 },
    };

    const sortKey = SORT_OPTIONS[req.query.sort] ? req.query.sort : 'newest';
    const sortOption = SORT_OPTIONS[sortKey];

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();

        if (user.role === 'company') {
          userObj.jobCount = await Job.countDocuments({ company: user._id });
        }
        if (user.role === 'candidate') {
          userObj.applicationCount = await Application.countDocuments({ candidate: user._id });
        }

        return userObj;
      })
    );

    const totalPages = Math.ceil(total / limit);

    sendPaginated(res, enrichedUsers, {
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
 * @desc    Get single user full detail by ID
 * @route   GET /api/admin/users/:id
 * @access  Admin only
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    const userObj = user.toObject();

    if (user.role === 'company') {
      userObj.jobCount = await Job.countDocuments({ company: user._id });
    }
    if (user.role === 'candidate') {
      userObj.applicationCount = await Application.countDocuments({ candidate: user._id });
    }

    userObj.lastLoginAt = user.lastLoginAt || null;
    userObj.accountAge = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    sendSuccess(res, 200, { user: userObj }, 'User details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate or deactivate a user account
 * @route   PATCH /api/admin/users/:id/status
 * @access  Admin only
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return sendError(res, 400, 'isActive must be a boolean value.');
    }

    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot deactivate your own account');
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    user.isActive = isActive;
    await user.save();

    // Deactivating a company cascades to their jobs
    if (!isActive && user.role === 'company') {
      await Job.updateMany({ company: user._id }, { isActive: false });
    }

    await createNotification({
      recipient: user._id,
      sender: req.user._id,
      type: 'account_update',
      title: isActive ? 'Account Activated' : 'Account Deactivated',
      message: isActive
        ? 'Your account has been activated by an administrator.'
        : 'Your account has been deactivated by an administrator.',
    });

    sendSuccess(res, 200, { user }, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change a user's role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Admin only
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['candidate', 'company', 'admin'];

    if (!role || !validRoles.includes(role)) {
      return sendError(res, 400, 'Valid role is required (candidate, company, admin).');
    }

    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot change your own role');
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    // Last admin protection
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return sendError(res, 400, 'Cannot change role. At least one admin must exist in the system.');
      }
    }

    user.role = role;
    await user.save();

    sendSuccess(res, 200, { user }, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a user and cascade all related data
 * @route   DELETE /api/admin/users/:id
 * @access  Admin only
 */
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot delete your own account');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    // Last admin protection
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return sendError(res, 400, 'Cannot delete the last admin account.');
      }
    }

    // Cascade deletions
    if (user.role === 'company') {
      const companyJobs = await Job.find({ company: user._id }).select('_id');
      const jobIds = companyJobs.map((j) => j._id);

      if (jobIds.length > 0) {
        await Application.deleteMany({ job: { $in: jobIds } });
        await SavedJob.deleteMany({ job: { $in: jobIds } });
        await Notification.deleteMany({ relatedJob: { $in: jobIds } });
      }
      await Job.deleteMany({ company: user._id });
    }

    if (user.role === 'candidate') {
      await Application.deleteMany({ candidate: user._id });
      await SavedJob.deleteMany({ candidate: user._id });
    }

    await Notification.deleteMany({ recipient: user._id });
    await User.findByIdAndDelete(user._id);

    sendSuccess(res, 200, null, 'User and all related data deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs for admin management
 * @route   GET /api/admin/jobs
 * @access  Admin only
 */
export const getAllJobsAdmin = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.isFeatured !== undefined) {
      filter.isFeatured = req.query.isFeatured === 'true';
    }

    const SORT_OPTIONS = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'name-asc': { title: 1 },
      'name-desc': { title: -1 },
    };

    const sortKey = SORT_OPTIONS[req.query.sort] ? req.query.sort : 'newest';
    const sortOption = SORT_OPTIONS[sortKey];

    const searchTerm = req.query.search?.trim();

    // Use aggregation when searching so we can match against the populated
    // company name as well as the job title/description in a single query.
    if (searchTerm) {
      const escaped = escapeRegex(searchTerm);
      const searchRegex = new RegExp(escaped, 'i');

      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'company',
            foreignField: '_id',
            as: 'company',
            pipeline: [
              {
                $project: {
                  companyName: 1,
                  companyLogo: 1,
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                },
              },
            ],
          },
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { title: searchRegex },
              { description: searchRegex },
              { 'company.companyName': searchRegex },
            ],
          },
        },
        { $sort: sortOption },
      ];

      const [countResult, jobs] = await Promise.all([
        Job.aggregate([...pipeline, { $count: 'total' }]),
        Job.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      ]);

      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return sendPaginated(res, jobs, {
        page,
        totalPages,
        total,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('company', 'companyName companyLogo firstName lastName email')
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
 * @desc    Toggle featured status of a job
 * @route   PATCH /api/admin/jobs/:id/featured
 * @access  Admin only
 */
export const toggleJobFeatured = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    job.isFeatured = !job.isFeatured;
    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate('company', 'companyName companyLogo firstName lastName');

    sendSuccess(
      res,
      200,
      { job: updatedJob },
      `Job ${job.isFeatured ? 'featured' : 'unfeatured'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle a job's active/inactive status (admin)
 * @route   PATCH /api/admin/jobs/:id/active
 * @access  Admin only
 */
export const toggleJobActive = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    job.isActive = !job.isActive;
    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate('company', 'companyName companyLogo firstName lastName');

    sendSuccess(
      res,
      200,
      { job: updatedJob },
      `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete any job with cascade (admin)
 * @route   DELETE /api/admin/jobs/:id
 * @access  Admin only
 */
export const deleteJobAdmin = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 404, 'Job not found.');
    }

    await Promise.all([
      Application.deleteMany({ job: job._id }),
      SavedJob.deleteMany({ job: job._id }),
      Notification.deleteMany({ relatedJob: job._id }),
    ]);

    await Job.findByIdAndDelete(job._id);

    sendSuccess(res, 200, null, 'Job and all related data deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for admin oversight
 * @route   GET /api/admin/applications
 * @access  Admin only
 */
export const getAllApplicationsAdmin = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.jobId) {
      filter.job = req.query.jobId;
    }

    if (req.query.candidateId) {
      filter.candidate = req.query.candidateId;
    }

    const searchTerm = req.query.search?.trim();
    const useAggregation = !!searchTerm;

    let applications;
    let total;

    if (useAggregation) {
      const escaped = escapeRegex(searchTerm);
      const searchRegex = new RegExp(escaped, 'i');

      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'candidate',
            foreignField: '_id',
            as: 'candidate',
            pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
          },
        },
        { $unwind: { path: '$candidate', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'jobs',
            localField: 'job',
            foreignField: '_id',
            as: 'job',
            pipeline: [{ $project: { title: 1, slug: 1 } }],
          },
        },
        { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'company',
            foreignField: '_id',
            as: 'company',
            pipeline: [{ $project: { companyName: 1 } }],
          },
        },
        { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { 'candidate.firstName': searchRegex },
              { 'candidate.lastName': searchRegex },
              { 'candidate.email': searchRegex },
              { 'job.title': searchRegex },
              { 'company.companyName': searchRegex },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
      ];

      const countPipeline = [...pipeline, { $count: 'total' }];
      const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

      const [countResult, data] = await Promise.all([
        Application.aggregate(countPipeline),
        Application.aggregate(dataPipeline),
      ]);

      total = countResult[0]?.total || 0;
      applications = data;
    } else {
      [applications, total] = await Promise.all([
        Application.find(filter)
          .populate('job', 'title')
          .populate('candidate', 'firstName lastName email')
          .populate('company', 'companyName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Application.countDocuments(filter),
      ]);
    }

    const totalPages = Math.ceil(total / limit);

    sendPaginated(res, applications, {
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
 * @desc    Get detailed platform analytics
 * @route   GET /api/admin/analytics
 * @access  Admin only
 */
export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

    const [
      userGrowth,
      jobTrends,
      applicationTrends,
      totalApplications,
      hiredApplications,
      topCompanies,
      topSkills,
      avgApplicationsPerJob,
      geographicDistribution,
    ] = await Promise.all([
      // User registrations per week, split by role
      User.aggregate([
        { $match: { createdAt: { $gte: twelveWeeksAgo } } },
        {
          $group: {
            _id: {
              week: { $isoWeek: '$createdAt' },
              year: { $isoWeekYear: '$createdAt' },
              role: '$role',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
      ]),

      // Jobs posted per week
      Job.aggregate([
        { $match: { createdAt: { $gte: twelveWeeksAgo } } },
        {
          $group: {
            _id: {
              week: { $isoWeek: '$createdAt' },
              year: { $isoWeekYear: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
      ]),

      // Applications per week
      Application.aggregate([
        { $match: { createdAt: { $gte: twelveWeeksAgo } } },
        {
          $group: {
            _id: {
              week: { $isoWeek: '$createdAt' },
              year: { $isoWeekYear: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
      ]),

      Application.countDocuments(),
      Application.countDocuments({ status: 'hired' }),

      // Top 10 companies by job count
      Job.aggregate([
        {
          $group: {
            _id: '$company',
            jobCount: { $sum: 1 },
          },
        },
        { $sort: { jobCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'companyInfo',
          },
        },
        { $unwind: '$companyInfo' },
        {
          $project: {
            _id: 1,
            jobCount: 1,
            companyName: '$companyInfo.companyName',
            companyLogo: '$companyInfo.companyLogo',
          },
        },
      ]),

      // Top skills in demand across active jobs
      Job.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),

      // Average applications per active job
      Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgApplications: { $avg: '$applicationCount' } } },
      ]),

      // Top 10 locations by job count
      Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const hiringSuccessRate = totalApplications > 0
      ? parseFloat(((hiredApplications / totalApplications) * 100).toFixed(1))
      : 0;

    sendSuccess(res, 200, {
      userGrowth,
      jobTrends,
      applicationTrends,
      hiringSuccessRate,
      topCompanies,
      topSkills: topSkills.map(({ _id, count }) => ({ skill: _id, count })),
      averageApplicationsPerJob: avgApplicationsPerJob[0]?.avgApplications
        ? parseFloat(avgApplicationsPerJob[0].avgApplications.toFixed(1))
        : 0,
      geographicDistribution: geographicDistribution.map(({ _id, count }) => ({
        location: _id,
        count,
      })),
    }, 'Platform analytics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

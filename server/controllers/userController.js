import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const CANDIDATE_PROFILE_FIELDS = [
  'firstName',
  'lastName',
  'title',
  'bio',
  'skills',
  'experience',
  'location',
  'avatar',
  'cvUrl',
  'portfolioUrl',
  'linkedinUrl',
  'githubUrl',
];

const COMPANY_PUBLIC_FIELDS = [
  'companyName',
  'companyLogo',
  'companyWebsite',
  'companyLocation',
  'companySize',
  'companyAbout',
  'companyIndustry',
  'companyFounded',
  'companySocials',
  'createdAt',
];

const CANDIDATE_COMPLETENESS_FIELDS = [
  'firstName',
  'lastName',
  'title',
  'bio',
  'skills',
  'experience',
  'location',
  'avatar',
  'cvUrl',
  'phone',
  'linkedinUrl',
  'githubUrl',
  'portfolioUrl',
  'desiredSalary',
];

const ALL_APPLICATION_STATUSES = [
  'pending',
  'reviewed',
  'shortlisted',
  'interviewed',
  'offered',
  'hired',
  'rejected',
  'withdrawn',
];

/**
 * Generates an array of the last N months as { month, year, label } objects.
 */
const getLastNMonths = (n) => {
  const months = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    });
  }

  return months;
};

/**
 * Calculates profile completeness percentage for candidates.
 */
const calculateProfileCompleteness = (user) => {
  let filled = 0;

  for (const field of CANDIDATE_COMPLETENESS_FIELDS) {
    const value = user[field];
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      const hasValue = Object.values(value).some(
        (v) => v !== undefined && v !== null && v !== ''
      );
      if (!hasValue) continue;
    }
    filled++;
  }

  return Math.round((filled / CANDIDATE_COMPLETENESS_FIELDS.length) * 100);
};

/**
 * @desc    Get company public profile
 * @route   GET /api/users/company/:id
 * @access  Public
 */
export const getCompanyPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid company ID.');
    }

    const company = await User.findOne({
      _id: id,
      role: 'company',
      isActive: true,
    }).select(COMPANY_PUBLIC_FIELDS.join(' '));

    if (!company) {
      return sendError(res, 404, 'Company not found.');
    }

    const activeJobs = await Job.find({ company: id, isActive: true })
      .select('title slug type location salary skills deadline createdAt')
      .sort({ createdAt: -1 });

    sendSuccess(
      res,
      200,
      { company, activeJobCount: activeJobs.length, activeJobs },
      'Company profile retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get candidate profile (for reviewing applicants)
 * @route   GET /api/users/candidate/:id
 * @access  Company/Admin only
 */
export const getCandidateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid candidate ID.');
    }

    const candidate = await User.findOne({
      _id: id,
      role: 'candidate',
      isActive: true,
    }).select(CANDIDATE_PROFILE_FIELDS.join(' '));

    if (!candidate) {
      return sendError(res, 404, 'Candidate not found.');
    }

    sendSuccess(
      res,
      200,
      { candidate },
      'Candidate profile retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get candidate dashboard statistics
 * @route   GET /api/users/candidate/dashboard
 * @access  Candidate only
 */
export const getCandidateDashboardStats = async (req, res, next) => {
  try {
    const candidateId = req.user._id;

    const [statusBreakdownResult, recentApplications, applicationsByMonthResult] =
      await Promise.all([
        Application.aggregate([
          { $match: { candidate: candidateId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),

        Application.find({ candidate: candidateId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate({
            path: 'job',
            select: 'title slug type',
            populate: {
              path: 'company',
              select: 'companyName',
            },
          }),

        Application.aggregate([
          { $match: { candidate: candidateId } },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const statusBreakdown = {};
    let totalApplications = 0;
    for (const status of ALL_APPLICATION_STATUSES) {
      statusBreakdown[status] = 0;
    }
    for (const item of statusBreakdownResult) {
      statusBreakdown[item._id] = item.count;
      totalApplications += item.count;
    }

    const monthMap = new Map();
    for (const item of applicationsByMonthResult) {
      monthMap.set(`${item._id.year}-${item._id.month}`, item.count);
    }

    const lastSixMonths = getLastNMonths(6);
    const applicationsByMonth = lastSixMonths.map((m) => ({
      month: m.label,
      count: monthMap.get(`${m.year}-${m.month}`) || 0,
    }));

    const profileCompleteness = calculateProfileCompleteness(req.user);

    sendSuccess(
      res,
      200,
      {
        totalApplications,
        statusBreakdown,
        recentApplications,
        applicationsByMonth,
        profileCompleteness,
      },
      'Candidate dashboard stats retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get company dashboard statistics
 * @route   GET /api/users/company/dashboard
 * @access  Company only
 */
export const getCompanyDashboardStats = async (req, res, next) => {
  try {
    const companyId = req.user._id;

    const [jobStats, applicationStats, recentApplications, applicationsByMonthResult] =
      await Promise.all([
        Job.aggregate([
          { $match: { company: companyId } },
          {
            $group: {
              _id: null,
              totalJobs: { $sum: 1 },
              activeJobs: {
                $sum: { $cond: ['$isActive', 1, 0] },
              },
              inactiveJobs: {
                $sum: { $cond: ['$isActive', 0, 1] },
              },
              totalApplications: { $sum: '$applicationCount' },
              totalViews: { $sum: '$views' },
            },
          },
        ]),

        Application.aggregate([
          { $match: { company: companyId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),

        Application.find({ company: companyId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('candidate', 'firstName lastName')
          .populate('job', 'title'),

        Application.aggregate([
          { $match: { company: companyId } },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const jobs = jobStats[0] || {
      totalJobs: 0,
      activeJobs: 0,
      inactiveJobs: 0,
      totalApplications: 0,
      totalViews: 0,
    };

    const statusBreakdown = {};
    let pendingApplications = 0;
    for (const status of ALL_APPLICATION_STATUSES) {
      statusBreakdown[status] = 0;
    }
    for (const item of applicationStats) {
      statusBreakdown[item._id] = item.count;
    }
    pendingApplications = statusBreakdown.pending;

    const monthMap = new Map();
    for (const item of applicationsByMonthResult) {
      monthMap.set(`${item._id.year}-${item._id.month}`, item.count);
    }

    const lastSixMonths = getLastNMonths(6);
    const applicationsByMonth = lastSixMonths.map((m) => ({
      month: m.label,
      count: monthMap.get(`${m.year}-${m.month}`) || 0,
    }));

    sendSuccess(
      res,
      200,
      {
        totalJobs: jobs.totalJobs,
        activeJobs: jobs.activeJobs,
        inactiveJobs: jobs.inactiveJobs,
        totalApplications: jobs.totalApplications,
        totalViews: jobs.totalViews,
        pendingApplications,
        statusBreakdown,
        recentApplications,
        applicationsByMonth,
      },
      'Company dashboard stats retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed company analytics
 * @route   GET /api/users/company/analytics
 * @access  Company only
 */
export const getCompanyAnalytics = async (req, res, next) => {
  try {
    const companyId = req.user._id;

    const [
      hiringFunnelResult,
      topPerformingJobs,
      weeklyTimelineResult,
      avgTimeToHireResult,
      skillsDemandResult,
      totalJobs,
    ] = await Promise.all([
      // Hiring funnel
      Application.aggregate([
        { $match: { company: companyId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Top performing jobs by applicationCount
      Job.find({ company: companyId })
        .sort({ applicationCount: -1 })
        .limit(5)
        .select('title slug applicationCount views isActive'),

      // Application source timeline — last 12 weeks
      Application.aggregate([
        {
          $match: {
            company: companyId,
            createdAt: {
              $gte: new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $isoWeekYear: '$createdAt' },
              week: { $isoWeek: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
      ]),

      // Average time to hire (days between application and 'hired' status)
      Application.aggregate([
        { $match: { company: companyId, status: 'hired' } },
        { $unwind: '$statusHistory' },
        { $match: { 'statusHistory.status': 'hired' } },
        {
          $project: {
            daysToHire: {
              $divide: [
                { $subtract: ['$statusHistory.changedAt', '$createdAt'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageDays: { $avg: '$daysToHire' },
            totalHired: { $sum: 1 },
          },
        },
      ]),

      // Skills demand across all company jobs
      Job.aggregate([
        { $match: { company: companyId } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Total jobs count
      Job.countDocuments({ company: companyId }),
    ]);

    // Build hiring funnel with conversion rates
    const funnelStages = [
      'pending',
      'reviewed',
      'shortlisted',
      'interviewed',
      'offered',
      'hired',
    ];
    const funnelMap = {};
    let totalApplications = 0;
    for (const item of hiringFunnelResult) {
      funnelMap[item._id] = item.count;
      totalApplications += item.count;
    }

    const hiringFunnel = funnelStages.map((stage, index) => {
      const count = funnelMap[stage] || 0;
      const prevCount =
        index === 0 ? totalApplications : funnelMap[funnelStages[index - 1]] || 0;
      return {
        stage,
        count,
        conversionRate:
          prevCount > 0 ? Math.round((count / prevCount) * 100) : 0,
      };
    });

    const weeklyTimeline = weeklyTimelineResult.map((item) => ({
      week: `W${item._id.week} ${item._id.year}`,
      count: item.count,
    }));

    const avgTimeToHire = avgTimeToHireResult[0]
      ? {
          averageDays: Math.round(avgTimeToHireResult[0].averageDays),
          totalHired: avgTimeToHireResult[0].totalHired,
        }
      : { averageDays: 0, totalHired: 0 };

    const skillsDemand = skillsDemandResult.map((item) => ({
      skill: item._id,
      count: item.count,
    }));

    sendSuccess(
      res,
      200,
      {
        totalApplications,
        totalJobs,
        hiringFunnel,
        topPerformingJobs,
        weeklyTimeline,
        avgTimeToHire,
        skillsDemand,
      },
      'Company analytics retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

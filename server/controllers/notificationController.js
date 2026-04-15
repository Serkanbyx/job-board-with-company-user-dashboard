import Notification from '../models/Notification.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

const SENDER_POPULATE_FIELDS = 'firstName lastName avatar companyName';

/**
 * @desc    Get authenticated user's notifications (paginated)
 * @route   GET /api/notifications
 * @access  Authenticated
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = { recipient: req.user._id };

    if (req.query.unreadOnly === 'true') {
      filter.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('sender', SENDER_POPULATE_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    sendPaginated(res, notifications, { page, totalPages, total, limit });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get count of unread notifications
 * @route   GET /api/notifications/unread-count
 * @access  Authenticated
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    sendSuccess(res, 200, { count }, 'Unread count retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Authenticated (owner only)
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    notification.isRead = true;
    await notification.save();

    sendSuccess(res, 200, { notification }, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Authenticated
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    sendSuccess(
      res,
      200,
      { modifiedCount: result.modifiedCount },
      'All notifications marked as read'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/notifications/:id
 * @access  Authenticated (owner only)
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    sendSuccess(res, 200, null, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};

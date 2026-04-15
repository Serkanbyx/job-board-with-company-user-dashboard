import Notification from '../models/Notification.js';

/**
 * Creates an in-app notification document.
 * Silently catches errors to prevent notification failures from blocking main operations.
 *
 * @param {Object} data
 * @param {import('mongoose').Types.ObjectId} data.recipient - User receiving the notification
 * @param {import('mongoose').Types.ObjectId} [data.sender] - User who triggered the notification
 * @param {string} data.type - Notification type enum value
 * @param {string} data.title - Short notification title
 * @param {string} data.message - Notification body text
 * @param {string} [data.link] - Frontend path to navigate on click
 * @param {import('mongoose').Types.ObjectId} [data.relatedJob] - Referenced job ID
 * @param {import('mongoose').Types.ObjectId} [data.relatedApplication] - Referenced application ID
 * @returns {Promise<import('mongoose').Document|null>}
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      recipient: data.recipient,
      sender: data.sender || null,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
      relatedJob: data.relatedJob || null,
      relatedApplication: data.relatedApplication || null,
    });
    return notification;
  } catch {
    return null;
  }
};

export default createNotification;

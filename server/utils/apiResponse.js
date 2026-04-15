export const sendSuccess = (res, statusCode, data, message) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const sendPaginated = (res, data, pagination) => {
  res.status(200).json({
    success: true,
    data,
    pagination,
  });
};

import mongoSanitize from 'express-mongo-sanitize';

const sanitizeInputs = (req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
};

export default sanitizeInputs;

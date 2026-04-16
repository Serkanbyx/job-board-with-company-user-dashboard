import { query } from 'express-validator';
import mongoose from 'mongoose';

export const checkSavedValidator = [
  query('jobIds')
    .notEmpty().withMessage('Job IDs are required')
    .custom((value) => {
      const ids = value.split(',').map((id) => id.trim());
      const allValid = ids.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!allValid) {
        throw new Error('All job IDs must be valid Mongo IDs');
      }
      return true;
    }),
];

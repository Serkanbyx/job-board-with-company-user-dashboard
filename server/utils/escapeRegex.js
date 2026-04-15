/**
 * Escapes regex special characters to prevent ReDoS attacks.
 * Used before passing user input to MongoDB $regex queries.
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;

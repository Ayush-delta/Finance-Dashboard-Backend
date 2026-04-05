const { ValidationError } = require('../utils/errors');

// validate(schema, target) — validates req[target] against a Zod schema
// Defaults to validating req.body
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError(errors));
    }

    // Replace with coerced/parsed values (e.g. string "2024-01-01" → Date)
    req[target] = result.data;
    next();
  };
};

module.exports = { validate };

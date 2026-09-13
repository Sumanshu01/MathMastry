/**
 * Middleware to validate request body using a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          error: errorMessages[0]?.message || 'Validation failed.',
          errors: errorMessages,
        });
      }
      return res.status(400).json({ error: 'Invalid request payload.' });
    }
  };
};

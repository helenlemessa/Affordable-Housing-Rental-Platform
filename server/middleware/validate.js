const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

   // In your validate middleware
if (error) {
  const errors = error.details.reduce((acc, curr) => {
    acc[curr.context.key] = curr.message;
    return acc;
  }, {});
  return res.status(400).json({ 
    message: "Validation failed",
    errors // Now returns field-specific errors
  });
}
    next();
  };
};

module.exports = validate;

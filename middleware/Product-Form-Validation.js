const Joi = require("joi");

const validateProduct = (req, res, next) => {
  // Define validation rules matching your schema constraints
  const schema = Joi.object({
    name: Joi.string().trim().max(100).required().messages({
      "string.empty": "Product name is required",
      "string.max": "Product name cannot exceed 100 characters",
    }),
    description: Joi.string().trim().required().messages({
      "string.empty": "Product description is required",
    }),
    price: Joi.number().min(0).required().messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
    }),
    // Validates that categoryId is a valid 24-character MongoDB Hex ObjectId
    categoryId: Joi.string().hex().length(24).required().messages({
      "string.hex": "Invalid Category ID format",
      "string.length": "Category ID must be 24 characters long",
    }),
    stockCount: Joi.number().integer().min(0).required().messages({
      "number.min": "Stock cannot be negative",
      "number.integer": "Stock must be a whole number",
    }),
  });

  // Execute validation
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    // Format error messages nicely into an array
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  next(); // Pass control to the next handler if validation passes
};

const validateProductUpate = (req, res, next) => {
  // Define validation rules matching your schema constraints
  const schema = Joi.object({
    name: Joi.string().trim().max(100).messages({
      "string.empty": "Product name is required",
      "string.max": "Product name cannot exceed 100 characters",
    }),
    description: Joi.string().trim().messages({
      "string.empty": "Product description is required",
    }),
    price: Joi.number().min(0).messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
    }),
    // Validates that categoryId is a valid 24-character MongoDB Hex ObjectId
    categoryId: Joi.string().hex().length(24).messages({
      "string.hex": "Invalid Category ID format",
      "string.length": "Category ID must be 24 characters long",
    }),
    stockCount: Joi.number().integer().min(0).messages({
      "number.min": "Stock cannot be negative",
      "number.integer": "Stock must be a whole number",
    }),
  });

  // Execute validation
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    // Format error messages nicely into an array
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  next(); // Pass control to the next handler if validation passes
};

module.exports = { validateProduct, validateProductUpate };

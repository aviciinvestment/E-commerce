const Joi = require("joi");

const validateAccountCreation = (req, res, next) => {
  const schema = Joi.object({
    fullname: Joi.string().trim().min(3).max(50).required(),

    email: Joi.string().trim().email().lowercase().required(),

    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      }),

    role: Joi.string()
      .valid("user", "admin", "manager") // Define your allowed roles
      .default("user"),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    // Returns all validation errors to Postman
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      errors: errorMessages,
      message: "Please check the form fields and try again.",
    });
  }

  // Replace req.body with sanitized values (lowercase email, trimmed names)
  req.body = value;
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().lowercase().required().messages({
      "string.email": "Please enter a valid email address.",
      "any.required": "Email is required.",
    }),

    password: Joi.string().required().messages({
      "any.required": "Password is required.",
    }),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  req.body = value; // Inject sanitized data
  next();
};

module.exports = { validateAccountCreation, validateLogin };

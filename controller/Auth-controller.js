const Users = require("../model/Users-schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const CreateAccount = async (req, res) => {
  const { fullname, email, password, role } = req.body;
  async function hashPassword(plainPassword) {
    const saltRounds = 10; // Sets the cost factor
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Save hashedPassword to your database
    return hashedPassword;
  }
  const hashedPassword = await hashPassword(password);
  Users.create({ fullname, email, password: hashedPassword, role })
    .then((data) =>
      res.status(201).json({
        success: true,
        message: "Account created successfully",
        data,
      }),
    )
    .catch((err) =>
      res.status(500).json({
        success: false,
        message: "Account creation failed",
        error: err.message,
      }),
    );
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email (Simulated DB call)
    const user = await Users.findOne({ email });

    if (!user) {
      // Keep error messages vague for security reasons (don't reveal if email exists)
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 2. Compare incoming raw password against the stored password (hashedPassword)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    // 3. Generate a secure JWT Token containing user data (including role)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_fallback_secret_key",
      { expiresIn: "1d" },
    );

    // 4. Return successful response along with user details
    res.status(200).json({
      status: "success",
      message: "Logged in successfully!",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during authentication." });
  }
};

module.exports = { CreateAccount, Login };

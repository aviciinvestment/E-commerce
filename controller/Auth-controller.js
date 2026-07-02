const Users = require("../model/Users-schema");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const CreateAccount = async (req, res) => {
  const { fullname, email, password, role } = req.body;
  try {
    const { fullname, email, password, role } = req.body;

    // 1. Strict database check: Ensure email isn't already taken
    const existingUser = await Users.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    // 2. Hash the raw password safely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Bundle user data into a token payload
    const activationPayload = {
      fullname,
      email,
      hashedPassword,
      role,
    };
    // 4. Sign the token with a short expiration window (e.g., 15-30 minutes)
    const activationToken = jwt.sign(
      activationPayload,
      process.env.JWT_SECRET,
      {
        expiresIn: "20m",
      },
    );

    // 5. Append the token string directly into your callback URL query string
    const confirmationLink = `http://localhost:3000/user_Auth/verify-email?token=${activationToken}`;

    // 6. Send the payload securely using Resend
    await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your production domain later
      to: email,
      subject: "Activate Your New Account",
      html: `
                <h2>Welcome to Our Platform, ${fullname}!</h2>
                <p>Please click the button below to confirm your email and instantiate your account profile:</p>
                <p><a href="${confirmationLink}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold;">Complete Registration</a></p>
                <p><strong>Security Notice:</strong> This activation link is state-encrypted and expires in 20 minutes.</p>
            `,
    });

    res.status(200).json({
      status: "success",
      message:
        "Activation link sent! Please check your email inbox to finalize creation.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server encountered an issue initializing activation payload.",
    });
  }
};
/////////////////////////////////////////////////////////////////////////////////////
const Verify_email = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Missing required registration activation token." });
    }

    // 1. Decode and verify signature integrity and token expiration automatically
    let decodedPayload;
    try {
      decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // Catches TokenExpiredError or JsonWebTokenError (tampered signature)
      return res.status(401).json({
        message:
          "Activation link is invalid or has expired. Please sign up again.",
      });
    }

    // 2. Extract user parameters from verified token structural payload
    const { fullname, email, hashedPassword, role } = decodedPayload;

    // 3. Safeguard: Final collision check right before saving (handles race conditions)
    const userExists = await Users.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ message: "This email was verified/registered already." });

    // 4. Create the final document inside the DB (Active by default, no unverified rows)
    const finalizedUser = await Users.create({
      fullname,
      email,
      password: hashedPassword, // Already hashed during signup phase
      role,
      isVerified: true,
    });

    // 5. Send an HTML success page or redirect directly to your login frontend client
    res.status(201).json({ message: "login successful" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal system error committing account." });
  }
};

////////////////////////////////////////////////////////////////////////////////////

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

module.exports = { CreateAccount, Login, Verify_email };

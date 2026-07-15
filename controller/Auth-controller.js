const Users = require("../model/Users-schema");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const CreateAccount = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    // 1. Strict database check: Ensure email isn't already taken
    const existingUser = await Users.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    // 2. Hash the raw password safely
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 2 hours
    const tokenExpiry = Date.now() + 3600000 * 2;

    // 3. Bundle user data into a token payload
    const newUser = await Users.create({
      fullname,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationTokenExpiry: tokenExpiry,
      isVerified: false, // Blocks login until true
    });

    // 5. Append the token string directly into your callback URL query string
    const confirmationLinks = `https://victorycommerce.vercel.app/verify-email?token=${verificationToken}&email=${email}`;
    //const confirmationLinks = `https://e-commerce-backend-9wqm.onrender.com/user_Auth/verify-email?token=${verificationToken}&email=${email}`;
    console.log(confirmationLinks);

    // 6. Send the payload securely using Resend
    await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your production domain later
      to: email,
      subject: "Activate Your New Account",
      html: `
                <h2>Welcome to Our Platform, ${fullname}!</h2>
                <p>Please click the button below to confirm your email and instantiate your account profile:</p>
                <p><a href="${confirmationLinks}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold;">Complete Registration</a></p>
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
      error: "Server error during registration",
    });
  }
};
/////////////////////////////////////////////////////////////////////////////////////
const Verify_email = async (req, res) => {
  try {
    const { token, email } = req.query;

    // 1. Safety check: Ensure query params are actually present
    if (!token || !email) {
      return res.status(400).json({
        message:
          "Invalid request. Missing verification token or email address.",
      });
    }

    // 2. Find user matching email and token
    const user = await Users.findOne({ email, verificationToken: token });

    console.log("Database result:", user);
    console.log("Query parameters received:", req.query);

    // 3. CRITICAL FIX: Add this safety check before reading properties of 'user'
    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired verification link. User account not found.",
      });
    }

    // 4. Check token expiration safely now that 'user' is guaranteed to exist
    if (Date.now() > user.verificationTokenExpiry) {
      return res.status(400).json({
        message: "Verification link has expired. Please register again.",
      });
    }

    // 5. Update account verification status and clear tokens
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // 6. Return response
    return res
      .status(200)
      .send(
        "<h1>Email Verified Successfully!</h1><p>You can now close this window and log in.</p>",
      );
  } catch (err) {
    console.error("Crash caught in Verify_email:", err);
    return res.status(500).json({
      error: "Internal system error committing account verification status.",
    });
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
    // Inside your login route logic...
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in.",
      });
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
    return res.status(200).json({
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
    return res
      .status(500)
      .json({ error: "Server error during authentication." });
  }
};

const Forgot_password = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // Generate a unique token for password reset
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save the reset token and its expiry to the user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Send the password reset email
    //const resetUrl = `https://e-commerce-backend-9wqm.onrender.com/user_Auth/resetpassword?token=${resetToken}&email=${email}`;
    const resetUrl = `https://victorycommerce.vercel.app/reset-password?token=${resetToken}&email=${email}`;
    console.log(resetUrl);
    // Send the password reset email
    await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your production domain later
      to: email,
      subject: "Reset Your Account Password",
      html: `
                <h2>Reset Password, ${user.fullname}!</h2>
                <p>Please click the button below to reset your password</p>
                <p><a href="${resetUrl}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold;">Complete Registration</a></p>
                <p><strong>Security Notice:</strong> This activation link is state-encrypted and expires in 20 minutes.</p>
            `,
    });
    return res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error during authentication.", err });
  }
};

const Reset_password = async (req, res) => {
  try {
    const { first_password, second_password } = req.body;
    const { token, email } = req.query;

    if (first_password !== second_password) {
      return res
        .status(404)
        .json({ message: "password not the same check and try again" });
    }
    const user = await Users.findOne({ email, resetPasswordToken: token });

    // 4. Check token expiration safely now that 'user' is guaranteed to exist
    if (Date.now() > user.resetPasswordExpiry) {
      return res.status(400).json({
        message: "Verification link has expired. Please try again.",
      });
    }
    const hashedPassword = await bcrypt.hash(first_password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    // 6. Return response
    return res
      .status(200)
      .send(
        "<h1>Users password successfully changed!</h1><p>You can now close this window and log in.</p>",
      );
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Server error during authentication.", e });
  }
};

module.exports = {
  CreateAccount,
  Login,
  Verify_email,
  Forgot_password,
  Reset_password,
};

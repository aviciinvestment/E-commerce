const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 1. Extract the bearer token from the incoming request authorization headers
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access Denied. Security session token is missing or malformed.",
    });
  }

  // Split out the raw token string from the "Bearer " layout prefix marker
  const token = authHeader.split(" ")[1];

  try {
    // 2. Decrypt the token using the secret signature key stored inside Render env logs
    // Replace 'your_jwt_secret_key' with process.env.JWT_SECRET if you utilize an environment variable file
    const secretKey = process.env.JWT_SECRET || "your_jwt_secret_key";
    const decodedPayload = jwt.verify(token, secretKey);

    // 3. Attach the decrypted user identity fields securely onto the request flow
    // This allows your profile controllers to immediately run: const userId = req.user.id;
    req.user = decodedPayload;

    next(); // Advance cleanly to your core profile controller functions
  } catch (err) {
    return res.status(403).json({
      success: false,
      message:
        "Authentication validation failed. Session token has expired or is invalid.",
    });
  }
};

module.exports = { verifyToken };

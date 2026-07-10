// 74. Role-Based Access Control (RBAC) Middleware Gatekeeper
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // For development testing, we look for a 'mockUserRole' sent in headers
    // Once Phase 16 JWT is built, this will be automatically read from: req.user.role
    const userRole = req.headers['x-user-role'] || 'customer'; 

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access Denied. Your role '${userRole}' is unauthorized to access this path.`
      });
    }

    next(); // Pass verification checks cleanly
  };
};

module.exports = { authorizeRoles };
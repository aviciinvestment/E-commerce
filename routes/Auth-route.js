const {
  CreateAccount,
  Login,
  Verify_email,
  Forgot_password,
  Reset_password,
} = require("../controller/Auth-controller");
const {
  UpdateProfileInfo,
  ChangeUserPassword,
} = require("../controllers/profileController");
const {
  validateAccountCreation,
  validateLogin,
  forget_login,
  reset_login,
} = require("../middleware/Auth-Form-Validation");
const { verifyToken } = require("../middleware/authMiddleware");
const router = require("express").Router();

// Mount the endpoints securely:
router.put("/profile/update", verifyToken, UpdateProfileInfo);
router.post("/change-password", verifyToken, ChangeUserPassword);

router.post("/createAccount", validateAccountCreation, CreateAccount);
router.get("/verify-email", Verify_email);
router.post("/login", validateLogin, Login);
router.post("/forgotpassword", forget_login, Forgot_password);
router.post("/resetpassword", reset_login, Reset_password);

module.exports = router;

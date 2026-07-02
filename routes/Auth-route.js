const {
  CreateAccount,
  Login,
  Verify_email,
  Forgot_password,
  Reset_password,
} = require("../controller/Auth-controller");
const {
  validateAccountCreation,
  validateLogin,
  forget_login,
  reset_login,
} = require("../middleware/Auth-Form-Validation");

const router = require("express").Router();

router.post("/createAccount", validateAccountCreation, CreateAccount);
router.get("/verifyemail", Verify_email);
router.post("/login", validateLogin, Login);
router.post("/forgotpassword", forget_login, Forgot_password);
router.post("/resetpassword", reset_login, Reset_password);

module.exports = router;

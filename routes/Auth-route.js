const {
  CreateAccount,
  Login,
  Verify_email,
} = require("../controller/Auth-controller");
const {
  validateAccountCreation,
  validateLogin,
} = require("../middleware/Auth-Form-Validation");

const router = require("express").Router();

router.post("/createAccount", validateAccountCreation, CreateAccount);
router.get("/verify-email", Verify_email);
router.post("/login", validateLogin, Login);

module.exports = router;

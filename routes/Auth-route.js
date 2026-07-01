const { CreateAccount, Login } = require("../controller/Auth-controller");
const {
  validateAccountCreation,
  validateLogin,
} = require("../middleware/Auth-Form-Validation");

const router = require("express").Router();

router.post("/createAccount", validateAccountCreation, CreateAccount);
router.post("/login", validateLogin, Login);

module.exports = router;

const { CreateAccount } = require("../controller/Auth-controller");

const router = require("express").Router();

router.post("/createAccount", CreateAccount);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  AddAddress,
  UpdateAddress,
  DeleteAddress,
  GetUserAddresses,
} = require("../controller/address-controller");

router.post("/address/add", AddAddress);
router.put("/address/update", UpdateAddress);
router.post("/address/delete", DeleteAddress);
router.get("/address/:userId", GetUserAddresses);

module.exports = router;

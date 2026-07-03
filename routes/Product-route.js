const router = require("express").Router();
const { CreateNewProduct } = require("../controller/products-controller");
const upload = require("../config/cloudinary");
const { validateProduct } = require("../middleware/Product-Form-Validation");
router.post(
  "/createNewProduct",
  upload.single("image"),
  validateProduct,
  CreateNewProduct,
);

module.exports = router;

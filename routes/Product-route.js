const router = require("express").Router();
const {
  CreateNewProduct,
  GetAllProducts,
  GetSingleProduct,
  UpdateProduct,
  DeleteProduct,
} = require("../controller/products-controller");
const upload = require("../config/cloudinary");
const {
  validateProduct,
  validateProductUpate,
} = require("../middleware/Product-Form-Validation");
router.post(
  "/createNewProduct",
  upload.single("image"),
  validateProduct,
  CreateNewProduct,
);
router.get("/getAllProducts", GetAllProducts);
router.get("/getSingleProduct/:id", GetSingleProduct);
router.put(
  "/updateProduct/:id",
  upload.single("image"),
  validateProductUpate,
  UpdateProduct,
);
router.delete("/deleteProduct/:id", DeleteProduct);

module.exports = router;

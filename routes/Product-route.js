const router = require("express").Router();
const {
  CreateNewProduct,
  GetAllProducts,
  GetSingleProduct,
  UpdateProduct,
  DeleteProduct,
  GetVendorAnalytics,
} = require("../controller/products-controller");
const upload = require("../config/cloudinary");
const {
  validateProduct,
  validateProductUpate,
} = require("../middleware/Product-Form-Validation");

// ⚡ IMPORT YOUR AUTH MIDDLEWARE HERE (adjust the path to match your actual file)
const { verifyToken } = require("../middleware/authMiddleware");

// Apply verifyToken to routes that modify data
router.post(
  "/createNewProduct",
  verifyToken, // ⚡ Added
  upload.single("image"),
  validateProduct,
  CreateNewProduct,
);

// Public routes (No verifyToken needed)
router.get("/getAllProducts", GetAllProducts);
router.get("/getSingleProduct/:id", GetSingleProduct);

// Apply verifyToken to update and delete
router.put(
  "/updateProduct/:id",
  verifyToken, // ⚡ Added
  upload.single("image"),
  validateProductUpate,
  UpdateProduct,
);

router.delete("/deleteProduct/:id", verifyToken, DeleteProduct); // ⚡ Added
router.get("/getVendorAnalytics", verifyToken, GetVendorAnalytics); // ⚡ Added

module.exports = router;

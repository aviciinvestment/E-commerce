const express = require("express");
const router = express.Router();
const {
  CreateNewCategory,
  UpdateExistingCategory,
  RemoveCategory,
  FetchAllCategories,
} = require("../controllers/categoryController");

// Public route that your frontend home controller calls
router.get("/categories", FetchAllCategories);

// Admin-protected operational routes
router.post("/categories/create", CreateNewCategory);
router.put("/categories/update", UpdateExistingCategory);
router.post("/categories/delete", RemoveCategory);

module.exports = router;

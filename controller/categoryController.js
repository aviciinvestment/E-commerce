const categoryService = require("../services/categoryService");

// 13. POST CREATE
const CreateNewCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await categoryService.createCategory(name, description);
    return res
      .status(201)
      .json({
        success: true,
        message: "Category created cleanly.",
        data: category,
      });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 14. PUT UPDATE
const UpdateExistingCategory = async (req, res) => {
  try {
    const { categoryId, name, description } = req.body;
    const updated = await categoryService.updateCategory(categoryId, {
      name,
      description,
    });
    return res
      .status(200)
      .json({
        success: true,
        message: "Category parameters updated.",
        data: updated,
      });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 15. DELETE MASTER CONTROL
const RemoveCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    await categoryService.deleteCategory(categoryId);
    return res
      .status(200)
      .json({
        success: true,
        message: "Category purged successfully from backend collections.",
      });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 16. GET PUBLIC INVENTORY LIST
const FetchAllCategories = async (req, res) => {
  try {
    const categoriesList = await categoryService.getAllCategories();
    return res
      .status(200)
      .json({
        success: true,
        count: categoriesList.length,
        data: categoriesList,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  CreateNewCategory,
  UpdateExistingCategory,
  RemoveCategory,
  FetchAllCategories,
};

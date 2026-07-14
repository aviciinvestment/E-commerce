const Category = require("../model/cartegory-schema");

class CategoryService {
  // 13. CREATE CATEGORY
  async createCategory(name, description) {
    const existing = await Category.findOne({
      name: name.toLowerCase().trim(),
    });
    if (existing)
      throw new Error("This category profile already exists in the system.");

    const newCategory = new Category({ name, description });
    return await newCategory.save();
  }

  // 14. UPDATE CATEGORY
  async updateCategory(categoryId, updateData) {
    const updated = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updateData },
      { new: true, runValidators: true },
    );
    if (!updated) throw new Error("Target category record missing.");
    return updated;
  }

  // 15. DELETE CATEGORY
  async deleteCategory(categoryId) {
    const deleted = await Category.findByIdAndDelete(categoryId);
    if (!deleted)
      throw new Error("Target category record missing from ledger.");
    return true;
  }

  // 16. GET ALL CATEGORIES
  async getAllCategories() {
    return await Category.find().sort({ name: 1 }); // Sorted alphabetically
  }
}

module.exports = new CategoryService();

const Product = require("../model/Products-schema"); // Import your Product schema
const Users = require("../model/Users-schema"); // Needed to verify the user is a vendor
// 1. CREATE PRODUCT (Secured & Vendor-Linked)
const CreateNewProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stockCount,
      categoryId,
      lowStockThreshold,
    } = req.body;

    // Extracted from your auth middleware
    const userId = req.user.id || req.user._id;
    const user = await Users.findById(userId);

    if (!user || !user.isVendor || !user.vendorId) {
      return res
        .status(403)
        .json({ message: "Only registered vendors can create products." });
    }

    // Auto-generate a unique SKU (required by your schema)
    const generatedSku =
      "PRD-" +
      Date.now().toString().slice(-6) +
      Math.floor(Math.random() * 1000);

    const imageUrl = req.file ? req.file.path : "";

    const newProduct = new Product({
      vendorId: user.vendorId, // ⚡ STRICTLY LINK TO THIS VENDOR
      sku: generatedSku, // ⚡ Auto-generated unique ID
      name,
      description,
      price,
      categoryId,
      stockCount,
      lowStockThreshold: lowStockThreshold || 10,
      images: imageUrl,
    });

    await newProduct.save();

    return res.status(200).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// 22. GET ALL PRODUCTS
// Includes optional search filtering and category population
const GetAllProducts = async (req, res) => {
  try {
    // 1. Destructure all query parameters from the URL
    const { search, category, minPrice, maxPrice, sort, page, limit } =
      req.query;
    // Base query conditions: only fetch active products
    let queryCondition = { isActive: true };

    if (search) {
      queryCondition.$text = { $search: search };
    }
    // Filter by Category ID
    if (category) {
      queryCondition.categoryId = category;
    }

    if (minPrice || maxPrice) {
      queryCondition.price = {};
      if (minPrice) queryCondition.price.$gte = Number(minPrice); // Greater than or equal to
      if (maxPrice) queryCondition.price.$lte = Number(maxPrice); // Less than or equal to
    }

    // 2. INITIALIZE MONGOOSE QUERY
    let mongooseQuery = Product.find(queryCondition).populate(
      "categoryId",
      "name",
    );

    if (sort) {
      const sortBy = sort.split(",").join(" ");
      mongooseQuery = mongooseQuery.sort(sortBy);
    } else {
      mongooseQuery = mongooseQuery.sort("-createdAt"); // Default sort: newest items first
    }

    // 28. PAGINATION LOGIC
    const currentPage = parseInt(page, 10) || 1; // Default to page 1
    const resultsPerPage = parseInt(limit, 10) || 10; // Default to 10 products per page
    const skipAmount = (currentPage - 1) * resultsPerPage;

    // Count total matching items before slicing with pagination (needed for front-end pagination bars)
    const totalMatchingProducts = await Product.countDocuments(queryCondition);

    // Execute the final built query string parameters
    const products = await mongooseQuery.skip(skipAmount).limit(resultsPerPage);
    // Return the items along with structured pagination metadata info
    return res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        totalItems: totalMatchingProducts,
        totalPages: Math.ceil(totalMatchingProducts / resultsPerPage),
        currentPage: currentPage,
        limit: resultsPerPage,
      },
      data: products,
    });
    if (req.query == {}) {
      const products = await Product.find({ isActive: true });
      return res.status(200).json(products);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 21. GET SINGLE PRODUCT BY ID
const GetSingleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("categoryId", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. UPDATE PRODUCT (Ownership Protected)
const UpdateProduct = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await Users.findById(userId);

    // Find the product first to check ownership
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ⚡ CRITICAL SECURITY: Does this vendor own this product?
    if (product.vendorId.toString() !== user.vendorId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You do not own this product." });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.images = req.file.path; // Or push to array depending on your frontend logic
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. DELETE PRODUCT (Ownership Protected)
const DeleteProduct = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await Users.findById(userId);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ⚡ CRITICAL SECURITY: Does this vendor own this product?
    if (product.vendorId.toString() !== user.vendorId.toString()) {
      return res.status(403).json({
        message: "Unauthorized: You cannot delete another vendor's product.",
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res
      .status(200)
      .json({ success: true, message: "Product deactivated safely!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// 4. GET VENDOR DASHBOARD ANALYTICS (Value Add)
const GetVendorAnalytics = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await Users.findById(userId);

    if (!user || !user.isVendor) {
      return res.status(403).json({ message: "Vendor access required." });
    }

    const vendorId = user.vendorId;

    // 1. Get all active products owned by this vendor
    const vendorProducts = await Product.find({ vendorId, isActive: true });

    // 2. Identify Low Stock Items (Crucial for vendors!)
    const lowStockItems = vendorProducts.filter(
      (p) => p.stockCount <= p.lowStockThreshold,
    );

    // 3. Calculate metrics (Assuming you have an Order schema later, this is where you'd aggregate)
    // For now, we return product-centric analytics
    const totalActiveProducts = vendorProducts.length;
    const totalInventoryValue = vendorProducts.reduce(
      (sum, item) => sum + item.price * item.stockCount,
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        totalActiveProducts,
        totalInventoryValue,
        lowStockAlerts: lowStockItems.length,
        lowStockItems: lowStockItems.map((item) => ({
          name: item.name,
          stock: item.stockCount,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  CreateNewProduct,
  GetAllProducts,
  GetSingleProduct,
  UpdateProduct,
  DeleteProduct,
  GetVendorAnalytics,
};

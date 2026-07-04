const Wishlist = require("../model/Wishlist-schema");
require("../model/Products-schema");
// 29. ADD TO WISHLIST
const AddToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // $addToSet automatically checks for duplicates before adding the item
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { products: productId } },
      { returnDocument: "after", upsert: true }, // upsert: true creates the wishlist document if it doesn't exist yet
    );

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist!",
      data: wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 30. REMOVE WISHLIST ITEM
const RemoveWishlistItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // $pull completely drops matching items out of your array list
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { products: productId } },
      { returnDocument: "after" },
    );

    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist!",
      data: wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 31. GET WISHLIST
const GetWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // Pull the user wishlist and automatically populate full details for all products inside it
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(200).json({ success: true, products: [] }); // Return empty array if no wishlist exists yet
    }

    return res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  AddToWishlist,
  RemoveWishlistItem,
  GetWishlist,
};

const Cart = require("../model/cart-schema");
const Product = require("../model/Products-schema");
require("../model/Products-schema");

// Reusable math utility (36. Cart Total Calculation)
const calculateCartTotals = (cart) => {
  let overallTotal = 0;
  cart.items.forEach((item) => {
    item.lineTotal = item.pricePerItem * item.quantity;
    overallTotal += item.lineTotal;
  });
  cart.cartTotal = Number(overallTotal.toFixed(2));
  return cart;
};

// Shared helper so every mutation returns the same populated shape as GetCart
const populateCart = async (cart) => {
  return cart.populate({
    path: "items.productId",
    select: "name price images description",
  });
};

// 32. ADD TO CART
const AddToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const qty = parseInt(quantity, 10) || 1;

    // Verify the product exists and pull its current price
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found or unavailable" });
    }

    // Find user's active cart or initialize an empty one if it doesn't exist
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], cartTotal: 0 });
    }

    // Straight comparison matching directly on the product ID
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (existingItemIndex > -1) {
      // If it exists, increment the quantity counter
      cart.items[existingItemIndex].quantity += qty;
    } else {
      // If it's a fresh item, push it to the array stack
      cart.items.push({
        productId,
        quantity: qty,
        pricePerItem: product.price,
        lineTotal: product.price * qty,
      });
    }

    // Recompute total calculations automatically (uses raw ObjectId — fine, math untouched)
    cart = calculateCartTotals(cart);
    await cart.save();

    // Populate AFTER save, so the totals above are computed before productId is swapped for the full object
    cart = await populateCart(cart);

    return res
      .status(200)
      .json({ success: true, message: "Item added to cart", data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 34. UPDATE QUANTITY
const UpdateQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const newQty = parseInt(quantity, 10);

    if (newQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1. Use remove endpoint to discard.",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in your cart" });
    }

    // Re-assign the new quantity and recompute sums
    cart.items[itemIndex].quantity = newQty;
    cart = calculateCartTotals(cart);

    await cart.save();
    cart = await populateCart(cart);

    return res
      .status(200)
      .json({ success: true, message: "Cart quantity adjusted", data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 33. REMOVE FROM CART
const RemoveFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Filter out the selected product item
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    // Recalculate totals after dropping the asset
    cart = calculateCartTotals(cart);
    await cart.save();
    cart = await populateCart(cart);

    return res.status(200).json({
      success: true,
      message: "Item dropped from cart successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 35. GET CART
const GetCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the cart and populate full details of the products currently sitting inside it
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price images description",
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: { items: [], cartTotal: 0 },
      });
    }

    return res.status(200).json({ success: true, data: cart });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { AddToCart, RemoveFromCart, UpdateQuantity, GetCart };

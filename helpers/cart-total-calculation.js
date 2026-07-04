const calculateCartTotals = (cart) => {
  let overallTotal = 0;

  cart.items.forEach((item) => {
    // Math: item price multiplied by how many pieces chosen
    item.lineTotal = item.pricePerItem * item.quantity;
    overallTotal += item.lineTotal;
  });

  cart.cartTotal = Number(overallTotal.toFixed(2)); // Round cleanly to two decimal places
  return cart;
};
module.exports = calculateCartTotals;

const User = require("../model/Users-schema");

// 37. ADD ADDRESS
const AddAddress = async (req, res) => {
  try {
    const { userId, street, city, state, zipCode, country, isDefault } =
      req.body;

    // If this address is set as default, unset any existing default address first
    if (isDefault) {
      await User.updateOne(
        { _id: userId, "addresses.isDefault": true },
        { $set: { "addresses.$.isDefault": false } },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          addresses: { street, city, state, zipCode, country, isDefault },
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: updatedUser.addresses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 38. UPDATE ADDRESS
const UpdateAddress = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    } = req.body;

    if (isDefault) {
      // Clear old default status before configuring the new one
      await User.updateOne(
        { _id: userId, "addresses.isDefault": true },
        { $set: { "addresses.$.isDefault": false } },
      );
    }

    // Use positional mapping operator ($) to locate and update the specific sub-document ID
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.street": street,
          "addresses.$.city": city,
          "addresses.$.state": state,
          "addresses.$.zipCode": zipCode,
          "addresses.$.country": country,
          "addresses.$.isDefault": isDefault,
        },
      },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User or Address location not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: updatedUser.addresses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 39. DELETE ADDRESS
const DeleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    // Pull targeted address item completely out of the array matching its _id
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Address removed cleanly",
      data: updatedUser.addresses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 40. GET USER ADDRESSES
const GetUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("addresses");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User profile record not found" });
    }

    return res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { AddAddress, UpdateAddress, DeleteAddress, GetUserAddresses };

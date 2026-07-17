const Users = require("../model/Users-schema");
const bcrypt = require("bcrypt");

class ProfileService {
  // Update Fullname and Email metadata
  async updateProfile(userId, fullname, email) {
    // Check if the new email is already claimed by another user
    if (email) {
      const existingUser = await Users.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: userId },
      });
      if (existingUser)
        throw new Error(
          "This email address is already claimed by another account.",
        );
    }

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      {
        $set: {
          fullname: fullname?.trim(),
          email: email?.toLowerCase().trim(),
        },
      },
      { new: true, runValidators: true },
    ).select("-password"); // Strips out the hashed password field for security

    if (!updatedUser) throw new Error("Target user record missing.");
    return updatedUser;
  }

  // Secure Password Change Verification Loop
  async changePassword(userId, currentPassword, newPassword) {
    const user = await Users.findById(userId);
    if (!user) throw new Error("Target user account missing.");

    // Verify the input password matches the old password stored in the database
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      throw new Error("The current password you typed is incorrect.");

    // Update the password property. The schema pre-save hook will hash it automatically!
    user.password = newPassword;
    await user.save();
    return true;
  }
}

module.exports = new ProfileService();

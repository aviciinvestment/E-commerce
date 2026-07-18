const profileService = require("../services/profileService");

// Update Info Controller Handler
const UpdateProfileInfo = async (req, res) => {
  try {
    // Extracted securely from your login token verify middleware wrapper!
    const userId = req.user.id || req.user._id;
    const { fullname, email } = req.body;

    if (!fullname && !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide parameters to update.",
      });
    }

    const updatedUser = await profileService.updateProfile(
      userId,
      fullname,
      email,
    );

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Your profile details have been updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Change Password Controller Handler
const ChangeUserPassword = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing current or new password values.",
      });
    }

    await profileService.changePassword(userId, currentPassword, newPassword);

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Your account password has been updated successfully.",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { UpdateProfileInfo, ChangeUserPassword };

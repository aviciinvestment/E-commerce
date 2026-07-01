const Users = require("../model/Users-schema");
const bcrypt = require("bcrypt");

const CreateAccount = async (req, res) => {
  const { fullname, email, password, role } = req.body;
  async function hashPassword(plainPassword) {
    const saltRounds = 10; // Sets the cost factor
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Save hashedPassword to your database
    return hashedPassword;
  }
  const hashedPassword = await hashPassword(password);
  Users.create({ fullname, email, password: hashedPassword, role })
    .then((data) =>
      res.status(201).json({
        success: true,
        message: "Account created successfully",
        data,
      }),
    )
    .catch((err) =>
      res.status(500).json({
        success: false,
        message: "Account creation failed",
        error: err.message,
      }),
    );
};

module.exports = { CreateAccount };

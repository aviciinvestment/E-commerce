const mongoose = require("mongoose");
require("dotenv").config();

const User = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("database connected succesfully");
  } catch (err) {
    console.log(err);
  }
};

module.exports = User;

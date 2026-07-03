const express = require("express");
require("dotenv").config();
const app = express();
const AuthRoute = require("./routes/Auth-route");
const ProductRoute = require("./routes/Product-route");
const User = require("./database/Users");

const PORT = process.env.PORT || 3000;
app.use(express.json());
User();
app.use("/user_Auth", AuthRoute);
app.use("/products", ProductRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

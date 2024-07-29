const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/user-route");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use("/", router);

mongoose
  .connect(
    "mongodb+srv://admin:io6x7myP2XhN7rYX@cluster0.vzrsczs.mongodb.net/auth?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    app.listen(5000);
    console.log("Database is connected and server started running at 5000");
  })
  .catch((err) => {
    console.log(err);
  });

//

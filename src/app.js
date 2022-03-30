import driver from "./routes/driver";
import delivery from "./routes/delivery";

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1/driver", driver);
app.use("/api/v1/delivery", delivery);

module.exports = app;

console.log("Listening to port :3000");

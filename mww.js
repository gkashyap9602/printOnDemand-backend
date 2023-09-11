require("./server/connection");
const {API_V1 } = require("./server/constants/const");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();
require('dotenv').config({path:path.resolve(__dirname, './server/.env')})

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// webhook.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(express.static(path.join(__dirname, "/server/views")));
app.use("/files", express.static(__dirname + "/server/uploads"));

app.get("/", (req, res) => {
  res.sendFile(path.join("/index.html"));
});

let administration = require("./server/routes/administration");
let users = require("./server/routes/users");
let common = require("./server/routes/common");

app.use(API_V1 + "administration", administration);
app.use(API_V1 + "users", users);
app.use(API_V1 + "common", common);

app.listen(process.env.PORT, () => {
  console.log(`https server running on port ${process.env.PORT}`);
});


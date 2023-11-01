require("./server/connection");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, './server/.env') })
const { API_V1 } = require("./server/constants/const");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require('helmet')
const app = express();
const cookieParser = require('cookie-parser')
const session = require('express-session')


app.use(helmet())
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));


app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    sameSite: 'lax',
    httpOnly: true,
    domain: "solidappmaker.ml",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000 //24 hours in miliseconds
  }
}));

app.use(cors({ origin: "*" }));
// app.use(cors({
//   origin: ["https://mwwdev.solidappmaker.ml", "http://localhost:4002", "http://localhost:3002"],
//   credentials:true
// }));

app.use(express.static(path.join(__dirname, "/server/views")));
app.use("/files", express.static(__dirname + "/server/uploads"));

app.get("/", (req, res) => {
  res.sendFile(path.join("/index.html"));
});


let administration = require("./server/routes/administration");
let users = require("./server/routes/users");
let common = require("./server/routes/common");
let category = require("./server/routes/category");
let product = require("./server/routes/product");
let productLibrary = require("./server/routes/productLibrary");
let gallery = require('./server/routes/Gallery');

app.use(API_V1 + "administration", administration,);
app.use(API_V1 + "user", users);
app.use(API_V1 + "common", common,);
app.use(API_V1 + "category", category,);
app.use(API_V1 + "product", product,);
app.use(API_V1 + "productLibrary", productLibrary,);
app.use(API_V1 + "gallery", gallery,);



app.listen(process.env.PORT || 3000, () => {
  console.log(`https server running on port ${process.env.PORT || 3000}`);
});


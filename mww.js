require("./server/connection");
const { API_V1 } = require("./server/constants/const");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const helmet = require('helmet')
const app = express();
const cookieParser = require('cookie-parser')
const csrf = require('csurf')

// const csrfProtection = csrf({
//   cookie: {
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// });

require('dotenv').config({ path: path.resolve(__dirname, './server/.env') })


app.use(helmet())
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cors({ origin: "*" }));
app.use(cors({

  origin: ["https://mwwdev.solidappmaker.ml", "http://localhost:4002", "http://localhost:3002"],
  credentials:true

}));
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
let gallery = require('./server/routes/Gallery')

app.use(API_V1 + "administration", administration,);
app.use(API_V1 + "user", users,);
app.use(API_V1 + "common", common,);
app.use(API_V1 + "category", category,);
app.use(API_V1 + "product", product,);
app.use(API_V1 + "productLibrary", productLibrary,);
app.use(API_V1 + "gallery", gallery,);



app.listen(process.env.PORT || 3000, () => {
  console.log(`https server running on port ${process.env.PORT || 3000}`);
});


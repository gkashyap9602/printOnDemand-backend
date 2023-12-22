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
const MongoStore = require("connect-mongo");
const helpers = require('./server/services/helper')
const isProduction = process.env.ENV_MODE === 'PROD';

console.log(isProduction, "isProduction===");
app.use(helmet())
app.enable('trust proxy', true);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors({
  origin: ["https://dev.mwwondemand.com", "http://localhost:3000", "http://localhost:3002"],
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
  credentials: true
}));


(async function () {
  const MONGODB_URI = await helpers.getParameterFromAWS({ name: 'MONGODB_URI' })
  let mongoUrl = `${MONGODB_URI}&authSource=${helpers.changeEnv(process.env.ENV_MODE).db}`
  app.use(session({
    name: "connect.sid",
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    // proxy: true,
    store: MongoStore.create({
      mongoUrl: mongoUrl,
      dbName: helpers.changeEnv(process.env.ENV_MODE).db,
      collectionName: "sessions",
      stringify: false,
      autoRemove: "interval",
      autoRemoveInterval: 1
    }),

    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24 hours in miliseconds
      // secure: isProduction,
      // httpOnly:false,
      // sameSite:"none"
      // maxAge: 5000, //5sec
    },
  }));

  app.use(express.static(path.join(__dirname, "/server/views")));
  app.use("/files", express.static(__dirname + "/server/uploads"));

  app.get("/", (req, res) => {
    res.sendFile(path.join("/index.html"));
  });
  //jkdd
  let administration = require("./server/routes/administration");
  let users = require("./server/routes/users");
  let common = require("./server/routes/common");
  let category = require("./server/routes/category");
  let product = require("./server/routes/product");
  let productLibrary = require("./server/routes/productLibrary");
  let gallery = require('./server/routes/Gallery');
  let order = require('./server/routes/Order');
  let store = require('./server/routes/Store');

  app.use(API_V1 + "administration", administration,);
  app.use(API_V1 + "user", users);
  app.use(API_V1 + "common", common,);
  app.use(API_V1 + "category", category,);
  app.use(API_V1 + "product", product,);
  app.use(API_V1 + "productLibrary", productLibrary,);
  app.use(API_V1 + "gallery", gallery,);
  app.use(API_V1 + "order", order,);
  app.use(API_V1 + "store", store,);


  app.listen(process.env.PORT || 3000, () => {
    console.log(`https server running on port ${process.env.PORT || 3000}`);
  });
  //self call fn ends here 
})()


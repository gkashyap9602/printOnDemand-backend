const helpers = require("../services/helper")
const mongoose = require('mongoose');
const path  = require('path')
 require('dotenv').config({path:path.resolve(__dirname, '../../server/.env')})

helpers.getParameterFromAWS({ name: helpers.changeEnv(process.env.ENV_MODE)}).then((MONGODB_URI) => {
    console.log(MONGODB_URI,"mongoooo")
    var mongoDB = MONGODB_URI
    mongoose.Promise = global.Promise;
    mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    var db = mongoose.connection;
    db.once('open', () => {
        console.log("connection established");
    })
});
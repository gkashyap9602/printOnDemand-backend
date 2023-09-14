const helpers = require("../services/helper")
const mongoose = require('mongoose');
const path  = require('path')
 require('dotenv').config({path:path.resolve(__dirname, '../../server/.env')})

helpers.getParameterFromAWS({ name: 'MONGODB_URI'}).then((MONGODB_URI) => {
    var mongoDB = `${MONGODB_URI}&authSource=${helpers.changeEnv(process.env.ENV_MODE)}`
    console.log(mongoDB,"mongoDbb Url")
    // 'mongodb://localhost:27017/mww'
    mongoose.Promise = global.Promise;
    mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName:helpers.changeEnv(process.env.ENV_MODE)
    });
    var db = mongoose.connection;
    db.once('open', () => {
        console.log("connection established");
    })
});
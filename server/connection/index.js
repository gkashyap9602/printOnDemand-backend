const helpers = require("../services/helper")
const mongoose = require('mongoose');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../server/.env') })
const { createAdmin } = require('./seed-admin')

// console.log(helpers.changeEnv(process.env.ENV_MODE).db,"helpers.changeEnv")
helpers.getParameterFromAWS({ name: 'MONGODB_URI' }).then((MONGODB_URI) => {
    var mongoDB = `${MONGODB_URI}&authSource=${helpers.changeEnv(process.env.ENV_MODE).db}`
    mongoose.Promise = global.Promise;
    mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: helpers.changeEnv(process.env.ENV_MODE).db
    })
        .then((sucess) => {
            createAdmin()

        })
    var db = mongoose.connection;
    db.once('open', () => {
        console.log("connection established");
    })
});
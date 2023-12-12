const helpers = require("../services/helper")
const mongoose = require('mongoose');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../server/.env') })
const { createAdmin, createWaitingList, createCommonContent } = require('./seed-admin')

helpers.getParameterFromAWS({ name: 'MONGODB_URI' }).then((MONGODB_URI) => {
    var mongoDB = `${MONGODB_URI}&authSource=${helpers.changeEnv(process.env.ENV_MODE).db}`
    console.log(mongoDB,"mongooooo");
    mongoose.Promise = global.Promise;
    mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: helpers.changeEnv(process.env.ENV_MODE).db
    })
        .then((sucess) => {
            createAdmin()
            createWaitingList()
            createCommonContent()

        })
    var db = mongoose.connection;
    db.once('open', () => {
        console.log("connection established");
    })
});

const APP_CONSTANTS = require("../constants/const");
// const administration = require(".././models/Administration");
const user = require('../models/Users')
const WaitingList = require('../models/WaitingList')
const CommonContent = require('../models/CommonContent')
const md5 = require('md5');
const helpers = require('../services/helper/index')

async function createAdmin() {
    let firstName = 'Admin';
    let lastName = 'Account';
    let hashPassword = md5('123456');
    let existsAdmin = await user.findOne({ userType: APP_CONSTANTS.ROLE.ADMIN_ROLE })
    if (!existsAdmin) {
        await user.create({
            firstName: firstName,
            lastName: lastName,
            email: 'admin@yopmail.com',
            userType: APP_CONSTANTS.ROLE.ADMIN_ROLE,
            password: hashPassword,
            phone: '9898989898',
            createdOn:helpers.getCurrentDate()
        });
        console.log('Admin Created ');
    }

}
async function createWaitingList() {
    let waitingList = await WaitingList.findOne({})
    if (!waitingList) {
        await WaitingList.create({
            isWaitingListEnable: false,
            createdOn:helpers.getCurrentDate()
        });
        // console.log('Admin Created ');
    }

}
async function createCommonContent() {
    let commonContent = await CommonContent.findOne({})
    if (!commonContent) {
        await CommonContent.create({
        createdOn:helpers.getCurrentDate()
        });
        // console.log('Admin Created ');
    }

}

module.exports = {createAdmin,createWaitingList,createCommonContent}
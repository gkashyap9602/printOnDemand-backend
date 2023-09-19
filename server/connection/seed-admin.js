const APP_CONSTANTS = require("../constants/const");
const administration = require(".././models/Administration");
const md5 = require('md5');
const helpers = require('../services/helper/index')
async function createAdmin() {
    let firstName = 'Admin';
    let lastName = 'Account';
    let hashPassword = md5('123456');
    let existsAdmin = await administration.findOne({ userType: APP_CONSTANTS.ROLE.ADMIN_ROLE })
    if (!existsAdmin) {
        await administration.create({
            firstName: firstName,
            lastName: lastName,
            email: 'admin@yopmail.com',
            userType: APP_CONSTANTS.ROLE.ADMIN_ROLE,
            password: hashPassword,
            phone: '9898989898',
            gender: 'Male',
            createdOn:helpers.getCurrentDate()
        });
        console.log('Admin Created ');
    }

}

module.exports = {createAdmin}
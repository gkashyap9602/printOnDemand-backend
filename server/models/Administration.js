var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Model For sub Admin
var AdministratorSchema = new Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        default: ''
    },
    profileImagePath: {
        type: String,
        default: null
    },
    status: {
        type: Number,
        default: 1,
        Comment: "1 for active 2 for soft delete 3 for deactivate "
    },
    userType: {
        type: Number,
        default: 2,
        Comment: "Subadmin"

    },
    createdOn: {
        type: String,
        default: null
    },
    updatedOn: {
        type: String,
        default: null
    }
});
module.exports = mongoose.model('Administrator', AdministratorSchema, 'administrator');
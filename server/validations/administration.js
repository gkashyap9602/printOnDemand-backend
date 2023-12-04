const joi = require("joi");

module.exports.updateWaitingList = {
    body: joi.object({
        value: joi.boolean().required()
    })

};


module.exports.addMaterial = {
    body: joi.object({
        name: joi.string().required(),
    })

};
module.exports.updateMaterial = {
    body: joi.object({
        materialId: joi.string().required(),
        name: joi.string(),
        status: joi.number()
    })

};

module.exports.saveNotification = {
    body: joi.object({
        type: joi.string().valid('MWW_Global', 'users').required(),
        title: joi.string().required(),
        userIds: joi.array(),
        description: joi.string().required(),

    })

};
module.exports.addSubAdmin = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        firstName: joi.string().required(),
        lastName: joi.string(),
        password: joi.string().required(),
        access: joi.array().required()

    })

};
module.exports.activeInactiveuser = {
    body: joi.object({
        status: joi.any().required(),
        userId: joi.string().required()

    })

};
module.exports.updateSubAdmin = {
    body: joi.object({
        subAdminId: joi.string().required(),
        firstName: joi.string(),
        lastName: joi.string(),
        access: joi.array(),
        status: joi.any()
    })

};
module.exports.deleteNotification = {
    body: joi.object({
        notificationId: joi.string().required(),
        type: joi.string().valid('MWW_Global', 'users').required(),

    })

};
module.exports.addToGallery = {
    body: joi.object({
        type: joi.number().valid(1, 2).required(), //1 for images 2 for videos
        title: joi.string(), //1 for images 2 for videos

    })

};
module.exports.deleteFromGallery = {
    body: joi.object({
        galleryId: joi.string().required(),
        type: joi.number().valid(1, 2).required(), //1 for images 2 for videos

    })

};

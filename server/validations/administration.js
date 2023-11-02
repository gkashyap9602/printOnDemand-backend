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

module.exports.saveNotification= {
    body: joi.object({
        type: joi.string().valid('MWW_Global', 'users').required(),
        title: joi.string().required(),
        userIds: joi.array(),
        description: joi.string().required(),

    })

};
module.exports.deleteNotification= {
    body: joi.object({
        notificationId: joi.string().required(),
        type: joi.string().valid('MWW_Global', 'users').required(),

    })

};
module.exports.addToGallery = {
    body: joi.object({
        type: joi.number().valid(1, 2).required(), //1 for images 2 for videos

    })

};
module.exports.deleteFromGallery = {
    body: joi.object({
        galleryId: joi.string().required(),
        type: joi.number().valid(1, 2).required(), //1 for images 2 for videos

    })

};

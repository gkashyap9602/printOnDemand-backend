var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Category = new Schema({
    name: {
        type: String,
        required: true,
        index:true
    },
    description: {
        type: String,
        default: "",
    },

    imageUrl: {
        type: String,
        default: null,
    },
    status: {
        type: Number,
        default: 0,
    },
    createdOn: {
        type: String,
        default: null,
    },
    updatedOn: {
        type: String,
        default: null,
    },
});



module.exports = mongoose.model("Category", Category, "category");

// Category.virtual('subCategories', {
//     ref: 'SubCategory',
//     localField: '_id',
//     foreignField: 'category_id',
//     justOne: false,
//   });

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductLibraryVarient = new Schema({
    productLibraryId: {
        type: mongoose.Types.ObjectId,
        ref: "ProductLibrary"
    },
    productVarientId: {
        type: mongoose.Types.ObjectId,
        ref: "ProductVarient"
    },
    price: {
        type: Number,
        default: null,

    },
    profit: {
        type: Number,
        default: null

    },
    productLibraryVarientImages: [{
        _id: {
            type: mongoose.Types.ObjectId,
            index: true
        },
        imageUrl: {
            type: String,
            default: null

        },
        displayOrder: {
            type: Number,
            default: 0

        },
    }],
    status: {
        type: Number,
        default: 1,
        Comment: "1 for active 2 for delete "

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

ProductLibraryVarient.pre('aggregate', function () {
    // Add a $match state to the beginning of each pipeline.
    this.pipeline().unshift({ $match: { status: { $ne: 2 } } });
})


module.exports = mongoose.model("ProductLibraryVarient", ProductLibraryVarient, "productLibraryVarient");

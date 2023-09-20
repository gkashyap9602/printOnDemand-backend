require('../db_functions');
let Common = require('../models/CommonContent');
let helpers = require('../services/helper')
let moment = require('moment');
let Category = require('../models/Category')
let ObjectId = require("mongodb").ObjectId
const ResponseMessages = require("../constants/ResponseMessages")
const Countries = require('../models/countries')
const commonUtil = {

    getCategories: async (data) => {
        const { includeSubCategory = false, searchKey = '' } = data

        console.log(includeSubCategory, "includeSubCategory")
        console.log(searchKey, "searchKey")
        const aggregationPipeline = [
            {
              $match: {
                $or: [
                  { name: { $regex: searchKey, $options: 'i' } },
                //   { 'subCategories.name': { $regex: searchKey, $options: 'i' } },
                ],
              },
            },
          ];
          
          let ff = Boolean(includeSubCategory)
          console.log(ff,"Ffff")
          //check if includeSubCategory is string or boolean both
          if (ff == true) {
            console.log(includeSubCategory,"under if ")
            // Add the $lookup stage for subCategories if includeSubCategory is true
            aggregationPipeline.push({
              $lookup: {
                from: 'subCategory',
                localField: '_id',
                foreignField: 'category_id',
                as: 'subCategories',
              },
            });
          }


        const result = await Category.aggregate(aggregationPipeline);
        // let result = await Category.aggregate([
        //     // { $match: { _id: mongoose.Types.ObjectId(user_id), status: 1 } },  // Match the specific user by _id and status
        //     {
        //         $lookup: {
        //             from: "subCategory",
        //             localField: "_id",
        //             foreignField: "category_id",
        //             as: "subCategories"
        //         }
        //     },

        // ])

        // let result = await Category.find({}).populate({path:'subCategories',model:'SubCategory'})


        console.log(result, "resultt")

        if (result.length < 0) {
            return helpers.showResponse(false, 'No Content Found', null, null, 200);
        }
        return helpers.showResponse(true, "Here is all Categories", result.length > 0 ? result[0] : {}, null, 200);
    },
    getAllCountries: async () => {

            // Query the MongoDB collection to retrieve all entries
            const allData = await Countries.find({}).lean(); // Use lean() for performance

            // Split the data into chunks of 100 items each
            const chunkedData = [];
            const chunkSize = 100;

            for (let i = 0; i < allData.length; i += chunkSize) {
              chunkedData.push(allData.slice(i, i + chunkSize));
            }
             
            // Send each chunk as a separate array in the response
            // res.json(chunkedData);
            console.log(chunkedData,"chunkedData")
      if (chunkedData.length < 0) {
          return helpers.showResponse(false, 'No Content Found', null, null, 200);
      }
      return helpers.showResponse(true, "Here is all Categories", chunkedData.length > 0 ? chunkedData : {}, null, 200);
  },
    // getPrivacyContent: async () => {
    //     let response = await getSingleData(Common, {}, 'privacy_policy -_id');
    //     if (response.status) {
    //         return helpers.showResponse(true, "Here is a Privacy Policy Content", response.data, null, 200);
    //     }
    //     return helpers.showResponse(false, 'No Content Found', null, null, 200);
    // },
    // getAbout: async () => {
    //     let response = await getSingleData(Common, {}, 'about -_id');
    //     if (response.status) {
    //         return helpers.showResponse(true, "Here is a About Content", response.data, null, 200);
    //     }
    //     return helpers.showResponse(false, 'No Content Found', null, null, 200);
    // },
    // getQuestions: async () => {
    //     let response = await getDataArray(FAQ, { status: { $ne: 2 } }, '', null, { created_on: -1 });
    //     if (response.status) {
    //         return helpers.showResponse(true, "Here is a list of questions", response.data, null, 200);
    //     }
    //     return helpers.showResponse(false, 'No data found', null, null, 200);
    // },
    // getCommonData: async () => {
    //     let response = await getSingleData(Common, {}, '');
    //     if (response.status) {
    //         return helpers.showResponse(true, "Here is a Data", response.data, null, 200);
    //     }
    //     return helpers.showResponse(false, 'No Content Found', null, null, 200);
    // },
    // updateCommonData: async (data) => {
    //     data.updated_on = moment().unix();
    //     let response = await updateByQuery(Common, data);
    //     if (response.status) {
    //         return helpers.showResponse(true, "Common details has been updated", null, null, 200);
    //     }
    //     return helpers.showResponse(false, "Update failed", response, null, 200);
    // },
    // addNewQuestion: async (data) => {
    //     let { question, answer } = data
    //     let newObj = {
    //         question,
    //         answer,
    //         status: 1,
    //         created_on: moment().unix()
    //     }
    //     let quesRef = new FAQ(newObj)
    //     let response = await postData(quesRef);
    //     if (response.status) {
    //         return helpers.showResponse(true, "New Question Added Successfully", null, null, 200);
    //     }
    //     return helpers.showResponse(false, "Unable to add new question at the moment", response, null, 200);
    // },
    // updateQuestion: async (data, ques_id) => {
    //     data.updated_on = moment().unix();
    //     let response = await updateData(FAQ, data, ObjectId(ques_id));
    //     if (response.status) {
    //         return helpers.showResponse(true, "Question has been updated", null, null, 200);
    //     }
    //     return helpers.showResponse(false, "Update failed", null, null, 200);
    // },
    storeParameterToAWS: async (data) => {
        let response = await helpers.postParameterToAWS({
            name: data.name,
            value: data.value
        })
        if (response) {
            return helpers.showResponse(true, ResponseMessages?.common.parameter_store_post_success, null, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.common.parameter_store_post_error, null, null, 200);
    },
    fetchParameterFromAWS: async (data) => {
        let response = await helpers.getParameterFromAWS({
            name: data?.name
        })
        if (response) {
            return helpers.showResponse(true, ResponseMessages?.common.parameter_data_found, response, null, 200);
        }
        return helpers.showResponse(false, ResponseMessages?.common.parameter_data_not_found, null, null, 200);
    }
}

module.exports = {
    ...commonUtil
}
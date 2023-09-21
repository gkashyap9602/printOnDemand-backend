require('../db_functions');
let helpers = require('../services/helper')
let Category = require('../models/Category')
const ResponseMessages = require("../constants/ResponseMessages")
const CSC2 = require('country-state-city');
const { default: mongoose } = require('mongoose');
const commonUtil = {

  getCategories: async (data) => {
    const { includeSubCategory = false, searchKey = '', parentCategoryGuid } = data
    // console.log(includeSubCategory, "includeSubCategory")
    // console.log(searchKey, "searchKey")
    const aggregationPipeline = [
      // {
      //   $match: {
      //     $or: [
      //       { name: { $regex: searchKey, $options: 'i' } },
      //       // { 'subCategories.name': { $regex: searchKey, $options: 'i' } },
      //     ],
      //   },
      // },


    ];

    if (includeSubCategory === 'true' || includeSubCategory === true) {


      if (parentCategoryGuid) {
        console.log("if parent")
        aggregationPipeline.push(
          {
            $match: {
              _id: mongoose.Types.ObjectId(parentCategoryGuid),

            },
          },
          {
            $lookup: {
              from: 'subCategory',
              localField: '_id',
              foreignField: 'category_id',
              as: 'subCategories',
            },
          },
          {
            $addFields: {
              subCategories: {
                $filter: {
                  input: '$subCategories',
                  as: 'subCategory',
                  cond: {
                    $or: [
                      { $regexMatch: { input: '$$subCategory.name', regex: searchKey, options: 'i' } },
                    ],
                  },
                },
              },
            },
          },
          {
            $unwind: '$subCategories', // Unwind the filtered subCategories array
          },
          {
            $replaceRoot: {
              newRoot: '$subCategories', // Replace the root with subCategories
            },
          }


        );

      } else {
        // Add the $lookup stage for subCategories if includeSubCategory is true
        aggregationPipeline.push({
          $lookup: {
            from: 'subCategory',
            localField: '_id',
            foreignField: 'category_id',
            as: 'subCategories',
          },

        });

        // // Match subCategories based on the searchKey within the $lookup stage
        // aggregationPipeline.push({
        //   $match: {
        //     $or: [
        //       { name: { $regex: searchKey, $options: 'i' } },
        //       { 'subCategories.name': { $regex: searchKey, $options: 'i' } },
        //     ],
        //   },
        // });

        // Filter subCategories based on the searchKey within the $lookup stage
        aggregationPipeline.push({
          $addFields: {
            subCategories: {
              $filter: {
                input: '$subCategories',
                as: 'subCategory',
                cond: {
                  $or: [
                    { $regexMatch: { input: '$$subCategory.name', regex: searchKey, options: 'i' } },
                  ],
                },
              },
            },
          },
        });

      }


    } else {

      // If includeSubCategory is false, only match the main categories
      aggregationPipeline.push({
        $match: {
          name: { $regex: searchKey, $options: 'i' },
        },
      });
    }
    //ends

    console.log(JSON.stringify(aggregationPipeline), "aggregationPipeline")

    const result = await Category.aggregate(aggregationPipeline);

    // const parentCategoryInfo = await 
    // console.log(result, "resultt")

    if (result.length < 0) {
      return helpers.showResponse(false, ResponseMessages.common.data_not_found, null, null, 404);
    }
    return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, result.length > 0 ? { categories: result,parentCategoryInfo:null } : {}, null, 200);
  },
  getAllCountries: async () => {

    const countries = CSC2.Country.getAllCountries(); // Use lean() for performance

    //change response of countries 
    const formattedCountries = countries.map((country, index) => ({
      id: index + 1,
      name: `${country.isoCode} - ${country.name}`,
      code: country.isoCode,
    }
    ));
    if (formattedCountries.length < 0) {
      return helpers.showResponse(false, ResponseMessages.common.data_not_found, null, null, 200);
    }
    return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, formattedCountries.length > 0 ? formattedCountries : {}, null, 200);
  },
  getAllStates: async (data) => {
    let { countryCode } = data
    let states = CSC2.State.getStatesOfCountry(countryCode);

    //change response of States 
    const formattedStates = states.map((states, index) => ({
      id: index + 1,
      countryId: index + 1,
      name: `${states.name}`,
      code: states.isoCode,
    }
    ));

    if (formattedStates.length < 0) {
      return helpers.showResponse(false, ResponseMessages.common.data_not_found, null, null, 200);
    }
    return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, formattedStates.length > 0 ? formattedStates : {}, null, 200);
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
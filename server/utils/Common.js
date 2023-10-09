require('../db_functions');
let helpers = require('../services/helper')
const ResponseMessages = require("../constants/ResponseMessages")
const CSC2 = require('country-state-city');
const Material = require('../models/Material')
const Product = require('../models/Product')
const { default: mongoose } = require('mongoose');
let ObjectId = require('mongodb').ObjectId
const WaitingList = require('../models/WaitingList')
const commonUtil = {

  getMaterials: async (data) => {
    const { subCategoryId } = data

    // const result = await getDataArray(Material, {})
    let aggregationPipeline = [

    ]

    if (subCategoryId) {
      console.log("underif")
      aggregationPipeline.push(
        {
          $lookup: {
            from: "product", // Replace with the actual name of the material collection
            localField: "_id",
            foreignField: "materialId",
            as: "products",
            // pipeline:[
            //   {
            //     $match: {
            //       '$products.subCategoryId': { $in: [new ObjectId(subCategoryId)] },
            //     }
            //   },
            // ]
          },

        },

        {
          $unwind: "$products" // Unwind the materials array
        },
        {
          $match: {
            "products.subCategoryId": { $in: [new ObjectId(subCategoryId)] }
          }
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" }, // Assuming the material document has a "name" field
            // Add other fields from the material document as needed
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            // Include other fields as needed
          }
        }
      )
    } else {
      aggregationPipeline.push(
        {
          $project: {
            _id: 1,
            name: 1,
            // Include other fields as needed
          }
        }
      )
    }


    const result = await Material.aggregate(aggregationPipeline)

    console.log(result, "resultttt")
    // if (result.length===0) {
    //   return helpers.showResponse(false, ResponseMessages?.material.not_exist, {}, null, 400);
    // }
    return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result, null, 200);
  },
  getAllCountries: async () => {

    const countries = CSC2.Country.getAllCountries()

    //change response of countries 
    const formattedCountries = countries.map((country, index) => ({
      id: index + 1,
      name: `${country.isoCode} - ${country.name}`,
      code: country.isoCode,
    }
    ));
    if (formattedCountries.length < 0) {
      return helpers.showResponse(false, ResponseMessages.common.data_not_found, null, null, 400);
    }
    return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, formattedCountries.length > 0 ? formattedCountries : {}, null, 200);
  },
  getAllStates: async (data) => {
    let { countryCode } = data
    let states = CSC2.State.getStatesOfCountry(countryCode);

    return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, states.length > 0 ? states : {}, null, 200);
  },
  getWaitingListStatus: async () => {
    let result = await getSingleData(WaitingList, {});
    if (!result.status) {
      return helpers.showResponse(true, ResponseMessages?.common.database_error, {}, null, 400);
    }
    return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, result?.data, null, 200);
  },


  storeParameterToAWS: async (data) => {
    let response = await helpers.postParameterToAWS({
      name: data.name,
      value: data.value
    })
    if (response) {
      return helpers.showResponse(true, ResponseMessages?.common.parameter_store_post_success, null, null, 200);
    }
    return helpers.showResponse(false, ResponseMessages?.common.parameter_store_post_error, null, null, 400);
  },

  fetchParameterFromAWS: async (data) => {
    let response = await helpers.getParameterFromAWS({
      name: data?.name
    })
    if (response) {
      return helpers.showResponse(true, ResponseMessages?.common.parameter_data_found, response, null, 200);
    }
    return helpers.showResponse(false, ResponseMessages?.common.parameter_data_not_found, null, null, 400);
  }
}

module.exports = {
  ...commonUtil
}
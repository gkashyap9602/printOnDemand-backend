require('../db_functions');
let helpers = require('../services/helper')
let Category = require('../models/Category')
const ResponseMessages = require("../constants/ResponseMessages")
const CSC2 = require('country-state-city');
const Material = require('../models/Material')
const { default: mongoose } = require('mongoose');
const commonUtil = {

  getMaterials: async (data) => {
    const result = await getDataArray(Material, {})
    if (!result.status) {
      return helpers.showResponse(false, ResponseMessages?.admin?.not_exist, {}, null, 403);
    }
    return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result?.data?.length > 0 ? result?.data : {}, null, 200);
  },
  getCategories: async (data) => {
    const { includeSubCategory = false, searchKey = '', parentCategoryGuid } = data
    let parentCategoryInfo = null
    const aggregationPipeline = [
      {
        $match: {
          name: { $regex: searchKey, $options: 'i' },
        },
      },
    ];

    if (includeSubCategory === 'true' || includeSubCategory === true) {

      aggregationPipeline.push(
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
      )


      if (parentCategoryGuid) {

        parentCategoryInfo = await getSingleData(Category, { _id: parentCategoryGuid })

        if (!parentCategoryInfo.status) {
          return helpers.showResponse(false, ResponseMessages.admin.category_not_exist, null, null, 404);
        }

        aggregationPipeline.push(
          {
            $match: {
              _id: mongoose.Types.ObjectId(parentCategoryGuid),

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
      }
    }

    const result = await Category.aggregate(aggregationPipeline);


    if (result.length < 0) {
      return helpers.showResponse(false, ResponseMessages.common.data_not_found, null, null, 404);
    }
    return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, result.length > 0 ? { categories: result, parentCategoryInfo: parentCategoryInfo?.data ? parentCategoryInfo?.data : null } : {}, null, 200);
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
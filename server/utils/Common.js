require('../db_functions');
let helpers = require('../services/helper')
const ResponseMessages = require("../constants/ResponseMessages")
const CSC2 = require('country-state-city');
const Material = require('../models/Material')
const { default: mongoose } = require('mongoose');
const commonUtil = {

  getMaterials: async (data) => {
    const result = await getDataArray(Material, {})
    if (!result.status) {
      return helpers.showResponse(false, ResponseMessages?.material.not_exist, {}, null, 400);
    }
    return helpers.showResponse(true, ResponseMessages?.common.data_retreive_sucess, result?.data?.length > 0 ? result?.data : {}, null, 200);
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
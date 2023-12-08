require('../db_functions');
let helpers = require('../services/helper')
const ResponseMessages = require("../constants/ResponseMessages")
const CSC2 = require('country-state-city');
const Material = require('../models/Material')
const Product = require('../models/Product')
let ObjectId = require('mongodb').ObjectId
const WaitingList = require('../models/WaitingList')
const commonContent = require('../models/CommonContent')
const axios = require('axios')
const { ZENDESK_AUTH, ZENDESK_BASE_URL } = require('../constants/const')
const Users = require('../models/Users')
const ShipMethod = require("../models/ShipMethod")
const commonUtil = {

  getMaterials: async (data) => {
    const { subCategoryId } = data

    let aggregationPipeline = [
      {
        $match: {
          status: { $ne: 2 }
        }
      },
    ]

    if (subCategoryId) {
      aggregationPipeline.push(
        {
          $lookup: {
            from: "product", // Replace with the actual name of the material collection
            localField: "_id",
            foreignField: "materialId",
            as: "products",
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
            name: { $first: "$name" },

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
  getAllShippingMethods: async () => {
    let result = await getDataArray(ShipMethod, {});
    // if (!result.status) {
    //   return helpers.showResponse(true, ResponseMessages?.common.database_error, {}, null, 400);
    // }
    console.log(result,"reulttt");
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
  },


  updateCommonContent: async (data) => {
    data.updatedOn = helpers.getCurrentDate();
    let response = await updateByQuery(commonContent, data);
    if (response.status) {
      return helpers.showResponse(true, "Common details has been updated", null, null, 200);
    }
    return helpers.showResponse(false, "Common details Update failed", response, null, 400);
  },

  // addNewQuestion: async (data) => {
  //   let { question, answer } = data
  //   let newObj = {
  //     question,
  //     answer,
  //     createdOn: helpers.getCurrentDate()
  //   }

  //   let quesRef = new FAQ(newObj)
  //   let response = await postData(quesRef);
  //   if (response.status) {
  //     return helpers.showResponse(true, "New Question Added Successfully", null, null, 200);
  //   }
  //   return helpers.showResponse(false, "Unable to add new question at the moment", response, null, 400);
  // },

  // updateQuestion: async (data) => {
  //   let { quesId } = data
  //   const findQues = await getSingleData(FAQ, { _id: quesId, status: { $ne: 2 } })
  //   if (!findQues.status) {
  //     return helpers.showResponse(false, ResponseMessages?.common.not_exist, {}, null, 400);
  //   }

  //   data.updatedOn = helpers.getCurrentDate();
  //   let response = await updateData(FAQ, data, new ObjectId(quesId));
  //   if (response.status) {
  //     return helpers.showResponse(true, "Question has been updated", null, null, 200);
  //   }
  //   return helpers.showResponse(false, "Question Update failed", null, null, 400);
  // },

  //   getQuestions: async (data) => {
  //     let { pageIndex = 1, pageSize = 10 } = data
  //     pageIndex = Number(pageIndex)
  //     pageSize = Number(pageSize)

  //     let pagination = {
  //       skip: (pageIndex - 1) * pageSize, // Calculate the number of documents to skip
  //       limit: pageSize, // Specify the number of documents to return
  //     }
  //     let totalCount = await getCount(FAQ, { status: { $ne: 2 } })

  //     let response = await getDataArray(FAQ, { status: { $ne: 2 } }, '', pagination, { createdOn: -1 });

  //     if (response.status) {
  //       return helpers.showResponse(true, "Here is a list of questions", { data: response.data, totalCount: totalCount.data }, null, 200);
  //     }
  //     return helpers.showResponse(false, 'No data found', null, null, 400);
  //   },

  getCommonContent: async () => {
    let response = await getSingleData(commonContent, {}, '');
    if (response.status) {
      return helpers.showResponse(true, "Here is a About Content", response.data, null, 200);
    }
    return helpers.showResponse(false, 'No Content Found', null, null, 400);
  },
  getFaqCategories: async (data) => {
    try {


      let { pageIndex = 1, pageSize = 10 } = data
      pageIndex = Number(pageIndex)
      pageSize = Number(pageSize)

      let response = await axios.get(`${ZENDESK_BASE_URL}/help_center/categories`, {
        headers: {
          Authorization: `Basic ${ZENDESK_AUTH}`,
          "Content-Type": "application/json",
        }
      })

      console.log(response.data, "responsee");

      if (response.data) {
        return helpers.showResponse(true, "Here is a Categories of faq", response.data, null, 200);
      }
      return helpers.showResponse(false, 'No data found', null, null, 400);
    } catch (error) {
      return helpers.showResponse(false, error.message, null, null, 400);

    }
  },
  getCategoriesArticle: async (data) => {
    try {


      let { pageIndex = 1, pageSize = 10 } = data
      pageIndex = Number(pageIndex)
      pageSize = Number(pageSize)

      let response = await axios.get(`${ZENDESK_BASE_URL}/help_center/articles?page=${pageIndex}&per_page=${pageSize}`, {
        headers: {
          Authorization: `Basic ${ZENDESK_AUTH}`,
          "Content-Type": "application/json",
        }
      })

      console.log(response.data, "responsee");

      if (response.data) {
        return helpers.showResponse(true, "Here is Articles of  Categories ", response.data, null, 200);
      }
      return helpers.showResponse(false, 'No data found', null, null, 400);
    } catch (error) {
      return helpers.showResponse(false, error?.message, null, null, 400);

    }
  },
  getSingleCategoryArticle: async (data) => {

    try {

      let { pageIndex = 1, pageSize = 10, categoryId } = data
      pageIndex = Number(pageIndex)
      pageSize = Number(pageSize)

      let response = await axios.get(`${ZENDESK_BASE_URL}/help_center/categories/${categoryId}/articles?page=${pageIndex}&per_page=${pageSize}`, {
        headers: {
          Authorization: `Basic ${ZENDESK_AUTH}`,
          "Content-Type": "application/json",
        }
      })

      console.log(response.data, "responsee");

      if (response.data) {
        return helpers.showResponse(true, "Here is Articles of  Category ", response.data, null, 200);
      }
      return helpers.showResponse(false, 'No data found', null, null, 400);

    } catch (error) {
      return helpers.showResponse(false, error?.message, null, null, 400);

    }
  },
  getSearchArticle: async (data) => {

    try {

      let { pageIndex = 1, pageSize = 10, query } = data
      pageIndex = Number(pageIndex)
      pageSize = Number(pageSize)

      let response = await axios.get(`${ZENDESK_BASE_URL}/help_center/articles/search?query=${query}&page=${pageIndex}&per_page=${pageSize}`, {
        headers: {
          Authorization: `Basic ${ZENDESK_AUTH}`,
          "Content-Type": "application/json",
        }
      })

      console.log(response.data, "responsee");

      if (response.data) {
        return helpers.showResponse(true, "Here is result in Articles  ", response.data, null, 200);
      }
      return helpers.showResponse(false, 'No data found', null, null, 400);

    } catch (error) {
      return helpers.showResponse(false, error?.message, null, null, 400);

    }
  },
  raiseTicket: async (data, userId) => {
    try {
      let { description, subject } = data
      let query = {
        status: { $ne: 2 },
        userType: 3,
        _id: userId

      }
      let findUser = await getSingleData(Users, query)

      if (!findUser.status) {
        return helpers.showResponse(false, ResponseMessages?.users.account_not_exist, {}, null, 400);
      }

      let body = {
        "request": {
          "requester": {
            "name": findUser.data.firstName + " " + findUser.data.lastName,
            "email": findUser.data.email
          },
          "subject": subject,
          "comment": {
            "body": description
          }
        }
      }

      console.log(body, "boddyyyyy");


      let response = await axios.post(`${ZENDESK_BASE_URL}/requests`, body, {
        headers: {
          Authorization: `Basic ${ZENDESK_AUTH}`,
          "Content-Type": "application/json",
        }
      })

      console.log(response.data, "responsee");

      if (response.data) {
        return helpers.showResponse(true, "Ticket Raise Successfully", response.data, null, 200);
      }
      return helpers.showResponse(false, 'Error Occur While Generating Ticket ', null, null, 400);

    } catch (error) {
      console.log(error, "errrrr");
      return helpers.showResponse(false, error?.message, null, null, 400);

    }
  },
}

module.exports = {
  ...commonUtil
}
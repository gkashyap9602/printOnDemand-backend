require('../db_functions');
let helpers = require('../services/helper')
const ResponseMessages = require("../constants/ResponseMessages")
const CSC2 = require('country-state-city');
const Material = require('../models/Material')
const Product = require('../models/Product')
const FAQ = require('../models/FAQ')
const { default: mongoose } = require('mongoose');
let ObjectId = require('mongodb').ObjectId
const WaitingList = require('../models/WaitingList')
const commonContent = require('../models/commonContent')

const commonUtil = {

  getMaterials: async (data) => {
    const { subCategoryId } = data

    let aggregationPipeline = []

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
  csrfToken: async (csrfToken) => {

    let data = (`
    <html>
    <head>
        <title>CSRF Demo</title>
    </head>
    <body>
        <h1>CSRF Demo</h1>
        <form action="/api/v1/common/transfer" method="POST">
        <input type="text" name="amount" placeholder="Amount" required>
        <input type="submit" value="Transfer">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        </form>
    </body>
    </html>
  `);
    return helpers.showResponse(true, ResponseMessages.common.data_retreive_sucess, data, null, 200);
  },
  submitCsrfToken: async (dataa, userSessionToken) => {
    console.log(dataa, "dataaaSubmit");
    console.log(userSessionToken, "userSessionToken");
    let { data } = dataa

    return helpers.showResponse(true, 'sucessfully transfer', {}, null, 200);
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

  addNewQuestion: async (data) => {
    let { question, answer } = data
    let newObj = {
      question,
      answer,
      createdOn: helpers.getCurrentDate()
    }

    // if ("answerVideo" in data && data.answerVideo !== "") {
    //   newObj.answerVideo = data.answerVideo
    //   let file_name = ""
    //   let actualVideoPath = `http://localhost:5030/files/${data.answerVideo}`
    //   console.log(actualVideoPath)
    //   file_name = `${new Date().getTime()}.jpeg`;
    //   let localPath = path.join(__dirname, "/../../uploads/thumbs/" + file_name)
    //   await Thumbler({
    //     type: 'video',
    //     input: actualVideoPath,
    //     output: localPath,
    //     time: '00:00:03',
    //     size: '150*150'
    //   }, async function (err, path) {
    //     if (err) {
    //       return helpers.showResponse(false, 'Thumbnail not Added', null, null, 400);
    //     }
    //   });
    //   newObj.answerVideoThumb = "thumbs/" + file_name
    // }

    let quesRef = new FAQ(newObj)
    let response = await postData(quesRef);
    if (response.status) {
      return helpers.showResponse(true, "New Question Added Successfully", null, null, 200);
    }
    return helpers.showResponse(false, "Unable to add new question at the moment", response, null, 400);
  },

  updateQuestion: async (data, quesId) => {

    const findQues = await getSingleData(FAQ, { _id: quesId, status: { $ne: 2 } })
    if (!findQues.status) {
      return helpers.showResponse(false, ResponseMessages?.common.not_exist, {}, null, 400);
    }
    // if ("answerVideo" in data && data.answerVideo !== "") {
    //   let file_name = ""
    //   let actualVideoPath = `http://localhost:5030/files/${data.answerVideo}`
    //   file_name = `${new Date().getTime()}.jpeg`;
    //   let localPath = path.join(__dirname, "/../../uploads/thumbs/" + file_name)
    //   await Thumbler({
    //     type: 'video',
    //     input: actualVideoPath,
    //     output: localPath,
    //     time: '00:00:10',
    //     size: '150*150'
    //   }, async function (err, path) {
    //     if (err) {
    //       return helpers.showResponse(false, 'Thumbnail not Added', null, null, 400);
    //     }
    //   });
    //   data.answer_video_thumb = "thumbs/" + file_name
    // }
    data.updatedOn = helpers.getCurrentDate();
    let response = await updateData(FAQ, data, ObjectId(quesId));
    if (response.status) {
      return helpers.showResponse(true, "Question has been updated", null, null, 200);
    }
    return helpers.showResponse(false, "Question Update failed", null, null, 400);
  },

  getCommonContent: async () => {
    let response = await getSingleData(commonContent, {}, '');
    console.log(response, "responseee");
    if (response.status) {
      return helpers.showResponse(true, "Here is a About Content", response.data, null, 200);
    }
    return helpers.showResponse(false, 'No Content Found', null, null, 400);
  },

  getQuestions: async (data) => {
    let { pageIndex, pageSize } = data
    pageIndex = Number(pageIndex)
    pageSize = Number(pageSize)

    let pagination = {
      skip: (pageIndex - 1) * pageSize, // Calculate the number of documents to skip
      limit: pageSize, // Specify the number of documents to return
    }
    let totalCount = await getCount(FAQ,{ status: { $ne: 2 } })

    let response = await getDataArray(FAQ, { status: { $ne: 2 } }, '', pagination, { createdOn: -1 });

    if (response.status) {
      return helpers.showResponse(true, "Here is a list of questions", {data:response.data,totalCount:totalCount.data}, null, 200);
    }
    return helpers.showResponse(false, 'No data found', null, null, 400);
  },
  // updateCommonData: async (data) => {
  //   data.updated_on = moment().unix();
  //   let response = await updateByQuery(commonContent, data);
  //   if (response.status) {
  //     return helpers.showResponse(true, "Common details has been updated", null, null, 200);
  //   }
  //   return helpers.showResponse(false, "Update failed", response, null, 200);
  // },
  // getCommonData: async () => {
  //   let response = await getSingleData(commonContent, {}, '');
  //   if (response.status) {
  //     return helpers.showResponse(true, "Here is a Data", response.data, null, 200);
  //   }
  //   return helpers.showResponse(false, 'No Content Found', null, null, 200);
  // },
}

module.exports = {
  ...commonUtil
}
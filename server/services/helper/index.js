var FCM = require("fcm-node");
const AWS = require("aws-sdk");
const mime = require('mime-types')
const crypto = require('crypto')
AWS.config.update({
    region: "us-east-1",
    credentials: new AWS.SharedIniFileCredentials({ profile: "default" }),
});
const consts = require('../../constants/const')
const axios = require('axios')
const XLSX = require("xlsx")
const moment = require('moment')
const ssm = new AWS.SSM();
const nodemailer = require("nodemailer");
const ResponseMessages = require("../../constants/ResponseMessages");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const NodeCache = require("node-cache");
const cache = new NodeCache();

const showResponse = (
    status,
    message,
    data = null,
    other = null,
    statusCode = null
) => {
    let response = {};
    response.status = status;
    response.message = message;
    if (statusCode !== null) {
        response.statusCode = statusCode;
    }
    if (data !== null) {
        response.data = data;
    }
    if (other !== null) {
        response.other = other;
    }
    return response;
};

const showOutput = (res, response, code) => {
    // delete response.code;
    res.status(code).json(response);
};
// const generateRandom4DigitNumber = (prefix, count) => {
//     const min = 1000;
//     const max = 9999;
//     const random4DigitNumber = Math.floor(Math.random() * (max - min + 1)) + min;

//     return prefix + random4DigitNumber;
// }
const generateOrderID = async (prefix, orderCount) => {

    let padStart = 4

    const isAllNine = orderCount.toString().split('').every(digit => digit === '9');

    if (isAllNine) {
        padStart = padStart + 1
    }
    //make sure that order count should be 4 digits 
    orderCount = orderCount.toString().padStart(4, 0)

    console.log(orderCount, "orderCount");


    const orderID = prefix + orderCount;

    return orderID;
};

const mongoError = (err) => {
    if (err.code === 11000 && err.name === 'MongoServerError') {
        let errKey = Object.keys(err?.keyValue).pop()
        return showResponse(false, `already exist value ${errKey}`, {}, null, 11000);
    } else {
        return showResponse(false, err);
    }
}

const validationError = async (res, error) => {
    const code = 403;
    const validationErrors = error.message.replace(new RegExp('\\"', "g"), "");
    // const validationErrors = error.details.map((error) => error.message.replace(new RegExp('\\"', "g"), ""));
    return res.status(code).json({
        status: false,
        statusCode: code,
        validationFailed: true,
        message: validationErrors,
    });
};

function generateRandomAlphanumeric(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

function generateRandomNumeric(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10).toString();
    }
    return result;
}
function generateUniqueCustomerId() {
    // Generate an alphanumeric part (e.g., using random characters)
    const alphanumericPart = generateRandomAlphanumeric(14); // 14 characters long

    // Generate a numeric counter (e.g., using random numbers)
    const numericCounter = generateRandomNumeric(8); // 8 digits long

    // Combine the alphanumeric and numeric parts to create the unique ID
    const uniqueID = `${alphanumericPart}:${numericCounter}`;

    return uniqueID;
}

const changeEnv = (env) => {
    if (env === "PROD") {
        return { db: "mww", bucket: "" }
    } else if (env === "STAG") {
        return { db: "mwwstag", bucket: "-stag" }

    } else {
        return { db: "mwwdev", bucket: "-dev" }
    }
};


const randomStr = (len, arr) => {
    var digits = arr;
    let OTP = "";
    for (let i = 0; i < len; i++) {
        OTP += digits[Math.floor(Math.random() * (arr.length - 1))];
    }
    if (OTP.length < len || OTP.length > len) {
        randomStr(len, arr);
    }
    return OTP;
};

function generateIDs(customerIDCount) {
    customerIDCount = 300000 + customerIDCount + 1;

    // Generate the customer ID (4-digit number)
    const customerID = customerIDCount.toString().padStart(6, '0');

    // Increment the customer ID count
    customerIDCount++;

    // Generate the ID (4-digit number)
    const idNumber = customerIDCount.toString().padStart(6, '0');

    return { idNumber, customerID };
}

const validateParams = (request, feilds) => {
    var postKeys = [];
    var missingFeilds = [];
    for (var key in request.body) {
        postKeys.push(key);
    }
    for (var i = 0; i < feilds.length; i++) {
        if (postKeys.indexOf(feilds[i]) >= 0) {
            if (request.body[feilds[i]] === "") missingFeilds.push(feilds[i]);
        } else {
            missingFeilds.push(feilds[i]);
        }
    }
    if (missingFeilds.length > 0) {
        let response = showResponse(
            false,
            `Following fields are required : ${missingFeilds}`
        );
        return response;
    }
    let response = showResponse(true, ``);
    return response;
};

const getCurrentDate = () => {
    return moment(Date.now()).format('YYYY-MM-DD[T]HH:mm:ss.SSSSSS');

}

const generateCsrfToken = () => {
    return crypto.randomUUID()
}



const exportExcel = async (filteredData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let filePath = `worksheet/${"Order"}-${new Date().getTime()}.xlsx`;
            // let local_path = path.resolve(`./server/uploads/${filePath}`);
            const workbook = XLSX.utils.book_new();

            let orderStatus = {
                1: "new",
                2: "inProduction",
                3: "shipped",
                4: "error",
                5: "recieved",
                6: "cancelled"
            }

            let sheetArray = [
                'Merch Maker ID', 'Order Id', 'Customer Name', 'Customer Email', 'Customer Phone',
                'Order Amount', 'Order Date', 'Order Status', "Shipping Method", 'Shipping Address',
                "Shipping State", 'Shipping Country', "Freight Amount", "Tracking", "Ship Date",
                "Shipment Weight", "Dimensions", "SKU", "Product Name", 'Quantity',
            ];
            // / Add more Fields to sheet Array /
            // let addressArraySize = 0;
            // let contactDetailArraySize = 0;

            // result?.forEach(item => {
            //     if (Array.isArray(item?.data)) {
            //         item?.data?.forEach(obj => {
            //             if (obj?.address?.length > addressArraySize) {
            //                 addressArraySize = obj?.address?.length;
            //             }
            //             if (obj?.emergency_contact_details?.length > contactDetailArraySize) {
            //                 contactDetailArraySize = obj?.emergency_contact_details?.length;
            //             }
            //         });
            //     }
            // });
            // for (let a = 0; a < addressArraySize; a++) {
            //     sheetArray.push(
            //         `Location-${a + 1}`, `State-${a + 1}`,
            //         `City-${a + 1}`, `Zipcode-${a + 1}`,
            //         `Latitude-${a + 1}`, `Longitude-${a + 1}`
            //     );
            // }
            // for (let c = 0; c < contactDetailArraySize; c++) {
            //     sheetArray.push(
            //         `Emergency Contact Name-${c + 1}`,
            //         `Emergency Contact Email-${c + 1}`,
            //         `Emergency Contact Number-${c + 1}`
            //     );
            // }
            // / Ends here /
            const sheet = XLSX.utils.aoa_to_sheet([sheetArray]);

            let rowData = [];

            for (let k = 0; k < filteredData?.length; k++) {
                let row = [];
                row.push(filteredData[k].displayId ?? '');
                row.push(filteredData[k].mwwOrderId ?? '');
                row.push(filteredData[k].userData.firstName ?? '');
                row.push(filteredData[k].userData.email ?? '');
                row.push(filteredData[k].shippingAddress.companyPhone ?? '');
                row.push(filteredData[k].amount ?? '');
                row.push(filteredData[k].orderDate ?? '');
                row.push(orderStatus[filteredData[k].status] ?? '');
                row.push(filteredData[k].shipMethodData.name ?? '');
                row.push(filteredData[k].shippingAddress.address1 ?? '');
                row.push(filteredData[k].shippingAddress.stateName ?? '');
                row.push(filteredData[k].shippingAddress.country ?? '');

                row.push(filteredData[k].freightAmount ?? '');
                row.push(filteredData[k].tracking ?? '');
                row.push(filteredData[k].shipDate ?? '');
                row.push(filteredData[k].shipmentWeight ?? '');
                row.push(filteredData[k].dimensions ?? '');
                row.push(filteredData[k].sku ?? '');

                if (filteredData[k]?.orderItems && filteredData[k]?.orderItems.length > 0) {

                    for (let j = 0; j < filteredData[k]?.orderItems?.length; j++) {
                        console.log(filteredData[k]?.orderItems, "orderItems");
                        row.push(filteredData[k]?.orderItems[j]?.productTitle ?? '');
                        row.push(filteredData[k]?.orderItems[j]?.quantity ?? '');

                    }
                }

                rowData.push(row);
            }

            let counter = 1;
            for (let k = 0; k < rowData.length; k++) {
                XLSX.utils.sheet_add_aoa(sheet, [rowData[k]], { origin: counter + 1, skipHeader: true });
                counter++;
            }
            XLSX.utils.book_append_sheet(workbook, sheet, 'Orders Data');
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            let excelLink = await uploadToS3ExcelSheet(buffer, filePath);
            return resolve({ status: true, message: "Excel for members created Successfully!", data: excelLink, code: 200 });

            //for local check use this 
            // fs.writeFile(local_path, buffer, (err) => {
            //     if (err) {
            //         return resolve({ status: false, message: "Error Occured in exporting patients age distribution excel", data: err.message, code: 200 });
            //     } else {
            //         return resolve({ status: true, message: "Excel for members created Successfully!", data: filePath, code: 200 });
            //     }
            // });

        } catch (err) {
            console.log(err)
            return resolve({ status: false, message: "Error Occured, please try again", data: err.message, code: 200 });
        }
    });
}
const sendExcelAttachement = async (filteredData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let filePath = `worksheet/${"Order"}-${new Date().getTime()}.xlsx`;
            // let local_path = path.resolve(`./server/uploads/${filePath}`);
            const workbook = XLSX.utils.book_new();

            let sheetArray = [
                'cust_Id', 'company_name', 'customer_name', 'address1', 'address2',
                'city', 'state', 'country', "zip", 'email',
                "phone", 'tax_id', "paytrace_token",
                "billing_name,", "billing_address1", "billing_address2", "billing_city", "billing_state",
                "billing_country", "billing_zip", "credit_name", "credit_address1", "credit_city", "credit_state",
                "credit_country", "credit_zip"

            ];

            const sheet = XLSX.utils.aoa_to_sheet([sheetArray]);

            let rowData = [];

            for (let k = 0; k < filteredData?.length; k++) {
                let row = [];
                row.push(filteredData[k].cust_Id ?? '');
                row.push(filteredData[k].company_name ?? '');
                row.push(filteredData[k].customer_name ?? '');
                row.push(filteredData[k].address1 ?? '');
                row.push(filteredData[k].address2 ?? '');
                row.push(filteredData[k].city ?? '');
                row.push(filteredData[k].state ?? '');
                row.push(filteredData[k].country ?? '');
                row.push(filteredData[k].zip ?? '');
                row.push(filteredData[k].email ?? '');
                row.push(filteredData[k].phone ?? '');
                row.push(filteredData[k].tax_id ?? '');
                row.push(filteredData[k].paytrace_token ?? '');

                row.push(filteredData[k].billing_name ?? '');
                row.push(filteredData[k].billing_address1 ?? '');
                row.push(filteredData[k].billing_address2 ?? '');
                row.push(filteredData[k].billing_city ?? '');
                row.push(filteredData[k].billing_state ?? '');
                row.push(filteredData[k].billing_country ?? '');
                row.push(filteredData[k].billing_zip ?? '');
                row.push(filteredData[k].credit_name ?? '');
                row.push(filteredData[k].credit_address1 ?? '');
                row.push(filteredData[k].credit_city ?? '');
                row.push(filteredData[k].credit_state ?? '');
                row.push(filteredData[k].credit_country ?? '');
                row.push(filteredData[k].credit_zip ?? '');

                rowData.push(row);
            }

            let counter = 1;
            for (let k = 0; k < rowData.length; k++) {
                XLSX.utils.sheet_add_aoa(sheet, [rowData[k]], { origin: counter + 1, skipHeader: true });
                counter++;
            }
            XLSX.utils.book_append_sheet(workbook, sheet, 'Orders Data');
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            let excelLink = await uploadToS3ExcelSheet(buffer, filePath);
            return resolve({ status: true, message: "Excel for members created Successfully!", data: excelLink, code: 200 });

            //for local check use this 
            // fs.writeFile(local_path, buffer, (err) => {
            //     if (err) {
            //         return resolve({ status: false, message: "Error Occured in exporting patients age distribution excel", data: err.message, code: 200 });
            //     } else {
            //         return resolve({ status: true, message: "Excel for members created Successfully!", data: filePath, code: 200 });
            //     }
            // });

        } catch (err) {
            console.log(err)
            return resolve({ status: false, message: "Error Occured, please try again", data: err.message, code: 200 });
        }
    });
}

const validateParamsArray = (data, feilds) => {
    var postKeys = [];
    var missingFeilds = [];
    for (var key in data) {
        postKeys.push(key);
    }
    for (var i = 0; i < feilds.length; i++) {
        if (postKeys.indexOf(feilds[i]) >= 0) {
            if (data[feilds[i]] == "") missingFeilds.push(feilds[i]);
        } else {
            missingFeilds.push(feilds[i]);
        }
    }
    if (missingFeilds.length > 0) {
        let response = showResponse(
            false,
            `Following fields are required : ${missingFeilds}`
        );
        return response;
    }
    let response = showResponse(true, ``);
    return response;
};

const dynamicSort = (property) => {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
        } else {
            return a[property].localeCompare(b[property]);
        }
    };
};

const arraySort = (arr) => {
    arr.sort((a, b) =>
        a.index > b.index
            ? 1
            : a.index === b.index
                ? a.index > b.index
                    ? 1
                    : -1
                : -1
    );
    return arr;
};

const validateEmail = (email) => {
    if (
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
            email
        )
    ) {
        return true;
    }
    return false;
};

const groupArray = (array, key) => {
    let group = array.reduce((r, a) => {
        r[a[key]] = [...(r[a[key]] || []), a];
        return r;
    }, {});
    return [group];
};

const capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

const Comma_seprator = (x) => {
    if (x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    } else {
        return x;
    }
};

const generateRandomKey = () => {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < 32; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        key += charset[randomIndex];
    }
    return key;
};

const sendFcmNotification = (to, data) => {
    return new Promise((resolve, reject) => {
        getParameterFromAWS({ name: "FIREBASE_SERVER_KEY" }).then(
            (FIREBASE_SERVER_KEY) => {
                var fcm = new FCM(FIREBASE_SERVER_KEY);

                var message = {
                    to,
                    priority: "high",
                    notification: data,
                    data,
                };
                fcm.send(message, (err, response) => {
                    if (err) {
                        console.log(err);
                        resolve(err);
                    }
                    resolve(JSON.parse(response));
                });
            }
        );
    });
};
const sendFcmNotificationTopic = (to, data) => {
    return new Promise((resolve, reject) => {
        getParameterFromAWS({ name: "FIREBASE_SERVER_KEY" }).then(
            (FIREBASE_SERVER_KEY) => {
                console.log(FIREBASE_SERVER_KEY);
                var fcm = new FCM(FIREBASE_SERVER_KEY);
                var message = {
                    to: "/topics/" + to,
                    priority: "high",
                    notification: data,
                    data,
                };
                fcm.send(message, (err, response) => {
                    if (err) {
                        console.log(err, "err of noification");
                        resolve(err);
                    }
                    console.log(response);
                    resolve(JSON.parse(response));
                });
            }
        );
    });
};
const sendFcmNotificationMultiple = (to, data, show) => {
    return new Promise((resolve, reject) => {
        getParameterFromAWS({ name: "FIREBASE_SERVER_KEY" }).then(
            (FIREBASE_SERVER_KEY) => {
                var fcm = new FCM(FIREBASE_SERVER_KEY);
                data = { ...data, show: show ? show : false };
                var message = {
                    registration_ids: to,
                    priority: "high",
                    notification: data,
                    data,
                };
                fcm.send(message, (err, response) => {
                    if (err) {
                        resolve(JSON.parse(err));
                    }
                    resolve(JSON.parse(response));
                });
            }
        );
    });
};

const getParameterFromAWS = (input) => {
    const cachedValue = cache.get(input?.name);
    if (cachedValue) {
        // Return the cached value
        return Promise.resolve(cachedValue);
    }
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                Name: input.name,
                WithDecryption: true,
            };
            ssm.getParameter(params, (err, data) => {
                if (err) {
                    console.log("err", err);
                    return resolve(null);
                }
                cache.set(input.name, data.Parameter.Value);
                return resolve(data.Parameter.Value);
            });
        } catch (err) {
            console.log("in catch", err);
            return resolve(null);
        }
    });
};

const postParameterToAWS = (input) => {
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                Name: input?.name,
                Type: "String",
                Value: input?.value,
                Overwrite: true,
            };
            ssm.putParameter(params, (err, output) => {
                return resolve(true);
            });
        } catch (error) {
            console.log("in catch err", error);
            return resolve(false);
        }
    });
};

const getSecretFromAWS = (secret_key_param) => {
    return new Promise((resolve, reject) => {
        try {
            const client = new AWS.SecretsManager({
                region: "us-east-1",
            });
            client.getSecretValue({ SecretId: secret_key_param }, (err, data) => {
                if (err) {
                    console.error(err);
                    return resolve(false);
                }
                return resolve(data);
            });
        } catch (e) {
            console.log("err in catch", e);
            return resolve(false);
        }
    });
};

const generatePayTraceToken = async () => {
    try {
        let credential = `grant_type=password&username=${consts.PAYTRACE_USERNAME}&password=${consts.PAYTRACE_PASSWORD}`

        const result = await axios.post(`${consts.PAYTRACE_URL}/oauth/token`, credential, {
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        if (result?.data?.access_token) {
            return showResponse(true, "payTrace Access Token Generate Successfully", { access_token: result?.data?.access_token }, null, 200)
        }
        return showResponse(false, "payTrace Access Token Generation Failed", error, null, 400)

    } catch (error) {
        return showResponse(false, error?.message, error, null, 400)
    }

}
const generatePaytraceId = async (dataPayTrace, access_token,) => {
    try {

        const result = await axios.post(`${consts.PAYTRACE_URL}/v1/customer/create`, dataPayTrace, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
            },
        })
        console.log(result, "result==Generateside");
        if (result?.data?.response_code === 160) {
            return showResponse(true, "payTrace Id generated Successfully", result.data, null, 200)
        }
        return showResponse(false, result?.data?.message ? result?.data?.message : "PaytraceId Token Not Generated", null, null, 400);

    } catch (error) {
        if (error.response.data.success == false) {
            let errorPayTrace = error.response.data.errors

            const firstErrorKey = Object.keys(errorPayTrace)[0];
            const firstErrorMessage = errorPayTrace[firstErrorKey].join(", ")
            console.log(firstErrorKey, "firstErrorKey");
            console.log(firstErrorMessage, "firstErrorMessage");

            return showResponse(false, `PayTrace Error Code ${firstErrorKey}`, firstErrorMessage, null, 400)

        }
        return showResponse(false, error?.message, null, null, 400)
    }

}

const addProductToShopify = async (endpointData, productData,) => {
    try {
        let { apiKey, shop, secret, storeVersion } = endpointData

        console.log(productData, "ProductData");

        let addToStoreUrl = `https://${apiKey}:${secret}@${shop}/${consts.SHOPIFY_ROUTES.SHOPIFY_CREATE_PRODUCT(storeVersion)}`

        // console.log(addToStoreUrl, "addToStoreUrl");
        //add to store shopify api to create product 
        const result = await axios.post(`${addToStoreUrl}`, productData, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${access_token}`,
            },
        })

        // console.log(result, "result==Store side");
        // console.log(result?.data, "result Dataa");
        console.log(result?.status, "result status");

        if (result?.status == 201) {
            return showResponse(true, "Product Added to Store Successfully", result?.data, null, 200)
        } else {

            return showResponse(false, "Error While Adding Product To Store!", null, null, 400);
        }

    } catch (error) {
        // console.log(error?.response, "error.response");
        // console.log(error?.response?.data, "error.responsedata");

        if (error?.response?.data?.errors) {
            let errorShopifyMessage = error?.response?.data?.errors
            // .replace('[API]', '')
            let statusCode = error?.response?.status
            let statusText = error?.response?.statusText

            return showResponse(false, `Shopify Error ${statusText} Code ${statusCode}`, errorShopifyMessage, null, 400)

        }
        return showResponse(false, error?.message, null, null, 400)
    }

}
const addProductVarientToShopify = async (endpointData, productVariantData, productId) => {
    try {
        let { apiKey, shop, secret, storeVersion } = endpointData

        let addProductVariantUrl = `https://${apiKey}:${secret}@${shop}/${consts.SHOPIFY_ROUTES.CREATE_PRODUCT_VARIENT(storeVersion, productId)}`

        console.log(addProductVariantUrl, "addProductVariantUrl");
        // const addProductVariantUrl = `https://${apiKey}:${secret}@${shop}/admin/api/2023-10/products/${productId}/variants.json`

        // //add to store shopify api to create product 
        // let veriant = {
        //     "variant": {
        //         "option1": "Yellow",
        //         "price": "1.00"
        //     }
        // }

        // console.log(veriant, "=============veriant")
        console.log(productVariantData, "=============productVariantData")



        const result = await axios.post(`${addProductVariantUrl}`, productVariantData[0], {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${access_token}`,
            },
        })

        if (result?.status == 201) {
            return showResponse(true, "Product Variant Added Successfully", result?.data, null, 200)
        } else {

            return showResponse(false, "Error While Adding Product Variant!", null, null, 400);
        }

    } catch (error) {
        // console.log(error?.response, "error.response");
        // console.log(error?.response?.data, "error.responsedata");

        if (error?.response?.data?.errors) {
            let errorShopifyMessage = error?.response?.data?.errors
            // .replace('[API]', '')
            let statusCode = error?.response?.status
            let statusText = error?.response?.statusText

            return showResponse(false, `Shopify Error ${statusText} Code ${statusCode}`, errorShopifyMessage, null, 400)

        }
        return showResponse(false, error?.message, null, null, 400)
    }

}
const updatePaytraceInfo = async (dataPayTrace, access_token,) => {
    try {

        const result = await axios.post(`${consts.PAYTRACE_URL}/v1/customer/update`, dataPayTrace, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
            },
        })
        console.log(result, "result==paytraceUpdate Side");
        if (result?.data?.response_code === 161) {
            return showResponse(true, "payTrace Profile update Successfully", result.data, null, 200)
        }
        return showResponse(false, result?.data?.message ? result?.data?.message : "Error While Updating Paytrace Info", null, null, 400);

    } catch (error) {
        if (error.response.data.success == false) {
            let errorPayTrace = error.response.data.errors

            const firstErrorKey = Object.keys(errorPayTrace)[0];
            const firstErrorMessage = errorPayTrace[firstErrorKey].join(", ")
            console.log(firstErrorKey, "firstErrorKey");
            console.log(firstErrorMessage, "firstErrorMessage");

            return showResponse(false, `PayTrace Error Code ${firstErrorKey}`, firstErrorMessage, null, 400)

        }
        return showResponse(false, error?.message, null, null, 400)
    }

}

const sendEmailService = async (to, subject, body, attachments = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let ACCESSID = await getParameterFromAWS({ name: "ACCESSID" });
            // let SecretResponse = await getSecretFromAWS("rico-secret");
            // let SECRET = SecretResponse?.SecretString;
            // let region = await getParameterFromAWS({ name: "REGION" });
            let transporter = nodemailer.createTransport({
                // SES: new AWS.SES({
                //   accessKeyId: ACCESSID,
                //   secretAccessKey: SECRET,
                //   region,
                //   apiVersion: "2010-12-01",
                // }),
                service: "gmail",
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: "mwwdemand@gmail.com",
                    pass: "mimy ifbn tdgj xswf",
                },
            });
            let mailOptions = {
                from: await getParameterFromAWS({ name: "FROM_SES" }),
                to,
                subject,
                html: body,
                attachments,
            };
            transporter.sendMail(mailOptions, (error, data) => {
                if (error) {
                    console.log(error, "error sendmail");
                    return resolve(
                        showResponse(
                            false,
                            ResponseMessages?.common?.email_sent_error,
                            error,
                            null,
                            200
                        )
                    );
                }
                return resolve(
                    showResponse(
                        true,
                        ResponseMessages?.common?.email_sent_success,
                        null,
                        null,
                        200
                    )
                );
            });
        } catch (err) {
            console.log("in catch err", err);
            return resolve(
                showResponse(false, ResponseMessages?.common?.aws_error, err, null, 200)
            );
        }
    });
};

const sendSMSService = async (to, Message) => {
    return new Promise(async (resolve, reject) => {
        try {
            let ACCESSID = await getParameterFromAWS({ name: "ACCESSID" });
            let SecretResponse = await getSecretFromAWS("rico-secret");
            let SECRET = SecretResponse?.SecretString;
            let region = await getParameterFromAWS({ name: "REGION" });
            AWS.config.update({
                accessKeyId: ACCESSID,
                secretAccessKey: SECRET,
                region,
            });
            const sns = new AWS.SNS();
            const params = {
                Message,
                PhoneNumber: to,
            };
            // Send the SMS
            sns.publish(params, (err, data) => {
                if (err) {
                    return resolve(
                        showResponse(
                            false,
                            ResponseMessages?.common?.sms_sent_error,
                            err,
                            null,
                            200
                        )
                    );
                } else {
                    return resolve(
                        showResponse(
                            true,
                            ResponseMessages?.common?.sms_sent_success,
                            data,
                            null,
                            200
                        )
                    );
                }
            });
        } catch (err) {
            console.log("in catch err", err);
            return resolve(
                showResponse(false, ResponseMessages?.common?.aws_error, err, null, 200)
            );
        }
    });
};

const addToMulter = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, callback) => {
        callback(null, true); // Accept the file
    },
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
})
const uploadVideoToS3 = async (files) => {
    try {
        let SecretResponse = await getSecretFromAWS("rico-secret");
        let region = await getParameterFromAWS({ name: "REGION" });
        const s3 = new AWS.S3({
            accessKeyId: await getParameterFromAWS({ name: "ACCESSID" }),
            secretAccessKey: SecretResponse?.SecretString,
            region,
        });
        let fileName = Date.now().toString() + Math.floor(Math.random() * 1000);
        const VideoOutputBucket = await getParameterFromAWS({
            name: "VideoOutputBucket",
        });
        const s3UploadPromises = files?.map(async (file) => {
            return new Promise(async (resolve, reject) => {
                if (file?.mimetype.indexOf("image") >= 0) {
                    let imageNewBuffer = await convertImageToWebp(file?.buffer);
                    if (imageNewBuffer) {
                        const params = {
                            Bucket: VideoOutputBucket,
                            ContentType: "image/webp",
                            Key: fileName + "/" + fileName + ".webp",
                            Body: imageNewBuffer,
                        };
                        s3.upload(params, (error, data) => {
                            if (error) {
                                console.log("bucketerror", error);
                                resolve(null);
                            } else {
                                resolve({ thumb_url: data.key });
                            }
                        });
                    }
                } else if (file?.mimetype.indexOf("video") >= 0) {
                    let fileExt = path.extname(file?.originalname);
                    const ElasticTranscoder = new AWS.ElasticTranscoder({
                        region,
                        apiVersion: "2012-09-25",
                    });
                    let VideoInputBucket = await getParameterFromAWS({
                        name: "VideoInputBucket",
                    });
                    let filePath = fileName + fileExt;
                    const params = {
                        Bucket: VideoInputBucket,
                        ContentType: file?.mimetype,
                        Key: filePath,
                        Body: file?.buffer,
                    };
                    s3.upload(params, async (error, data) => {
                        if (error) {
                            console.log("file upload to s3 error", error);
                            return resolve(null);
                        }
                        // Set the pipeline ID and output prefix
                        const PipeLineId = await getParameterFromAWS({
                            name: "PipeLineId",
                        });
                        const OutputKeyPrefix = `${data?.Key.split(".")[0]}/`;
                        // Set the output parameters
                        const outputs = [
                            {
                                Key: OutputKeyPrefix + "hls_400k",
                                PresetId: "1351620000001-200050",
                                SegmentDuration: "10",
                            },
                            {
                                Key: OutputKeyPrefix + "hls_1m",
                                PresetId: "1351620000001-200030",
                                SegmentDuration: "10",
                            },
                            {
                                Key: OutputKeyPrefix + "hls_2m",
                                PresetId: "1351620000001-200010",
                                SegmentDuration: "10",
                            },
                        ];
                        // Set the input parameters
                        const input = {
                            Key: data?.Key,
                        };
                        // Set the job parameters
                        const params = {
                            PipelineId: PipeLineId,
                            Input: input,
                            Outputs: outputs,
                        };
                        // Create the transcoding job
                        await ElasticTranscoder.createJob(params).promise();
                        // Get the URLs of the transcoded files
                        const VideoBase = await getParameterFromAWS({ name: "VideoBase" });
                        const hls400kUrl = `${VideoBase}${OutputKeyPrefix}hls_400k.m3u8`;
                        const hls1mUrl = `${VideoBase}${OutputKeyPrefix}hls_1m.m3u8`;
                        const hls2mUrl = `${VideoBase}${OutputKeyPrefix}hls_2m.m3u8`;
                        // Create the playlist string
                        const playlistString =
                            "#EXTM3U\n" +
                            "#EXT-X-VERSION:3\n" +
                            "#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=640x360\n" +
                            hls400kUrl +
                            "\n" +
                            "#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=960x540\n" +
                            hls1mUrl +
                            "\n" +
                            "#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1280x720\n" +
                            hls2mUrl +
                            "\n";
                        // Create playlist.m3u8 file
                        const playlistParams = {
                            Bucket: VideoOutputBucket,
                            Key: `${OutputKeyPrefix}playlist.m3u8`,
                            ContentType: "application/x-mpegURL",
                            Body: playlistString,
                        };
                        await s3.putObject(playlistParams).promise();
                        resolve({ video_url: playlistParams.Key });
                    });
                } else {
                    resolve(null);
                }
            });
        });
        const s3UploadResults = await Promise.all(s3UploadPromises);
        let video_url = null;
        s3UploadResults?.map((resp) => {
            if (resp && resp?.video_url) {
                video_url = resp?.video_url;
            }
        });
        if (video_url) {
            return showResponse(
                true,
                ResponseMessages?.common?.file_upload_success,
                video_url,
                null,
                200
            );
        }
        return showResponse(
            false,
            ResponseMessages?.common?.file_upload_error,
            null,
            null,
            200
        );
    } catch (err) {
        console.log(`Error creating transcoding job`, err);
        return showResponse(
            false,
            ResponseMessages?.common?.file_upload_error,
            err,
            null,
            200
        );
    }
};

// using ffmpeg and its too much time
const createVideoThumbnail = async (videoFileName, fileExt) => {
    return new Promise(async (resolve, reject) => {
        try {
            let SecretResponse = await getSecretFromAWS("rico-secret");
            let region = await getParameterFromAWS({ name: "REGION" });
            const s3 = new AWS.S3({
                accessKeyId: await getParameterFromAWS({ name: "ACCESSID" }),
                secretAccessKey: SecretResponse?.SecretString,
                region,
            });
            let VideoInputBucket = await getParameterFromAWS({
                name: "VideoInputBucket",
            });
            const inputFileName = `${videoFileName}${fileExt}`;
            const outputFileName = `${videoFileName}-thumbnail.jpg`;
            const stream = s3
                .getObject({ Bucket: VideoInputBucket, Key: inputFileName })
                .createReadStream();
            ffmpeg(stream)
                .screenshots({
                    count: 1,
                    filename: outputFileName,
                    folder: "/tmp",
                    timemarks: ["4"],
                })
                .on("end", async () => {
                    // Upload the thumbnail to S3
                    const thumbnailPath = `/tmp/${outputFileName}`;
                    const thumbnailFileContent = fs.readFileSync(thumbnailPath);
                    const thumbnailUploadParams = {
                        Bucket: await getParameterFromAWS({ name: "VideoOutputBucket" }),
                        Key: `${videoFileName}/${outputFileName}`,
                        Body: thumbnailFileContent,
                    };
                    s3.upload(thumbnailUploadParams, (err, data) => {
                        if (err) {
                            return resolve(
                                showResponse(
                                    false,
                                    ResponseMessages?.common?.thumbnail_error,
                                    err,
                                    null,
                                    200
                                )
                            );
                        }
                        return resolve(
                            showResponse(
                                true,
                                ResponseMessages?.common?.thumbnail_generated,
                                data,
                                null,
                                200
                            )
                        );
                    });
                })
                .on("error", (err) => {
                    return resolve(
                        showResponse(
                            false,
                            ResponseMessages?.common?.thumbnail_error,
                            err,
                            null,
                            200
                        )
                    );
                });
        } catch (err) {
            return resolve(
                showResponse(
                    false,
                    ResponseMessages?.common?.thumbnail_error,
                    err,
                    null,
                    200
                )
            );
        }
    });
};


const convertImageToWebp = async (imageInBuffer) => {
    console.log(imageInBuffer, "imageinbuffer")
    return new Promise((resolve, reject) => {
        sharp(imageInBuffer)
            .webp({ quality: 50 })
            .toBuffer()
            .then(async (newBuffer) => {
                resolve(newBuffer);
            })
            .catch((err) => {
                resolve(false);
            });
    });
};
// const uploadAudioToS3 = async (files) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       if (files?.length > 0) {
//         let filesResponse = await uploadToS3(files);
//         resolve(filesResponse);
//       } else {
//         resolve(null);
//       }
//     } catch (err) {
//       console.log(`in catch error 472`, err);
//       return resolve(null);
//     }
//   });
// };
const uploadFileToS3 = async (files) => {
    return new Promise(async (resolve, reject) => {
        try {
            let webpFilesArray = [];
            for (let i = 0; i < files?.length; i++) {
                let file = files[i];
                let mime_type = file?.mimetype.split("/")[0];
                console.log(mime_type, "mimeTypess");
                if (mime_type == "image" && !file.originalname.endsWith(".psd")) {
                    console.log("under webp");
                    let imageNewBuffer = await convertImageToWebp(file?.buffer);

                    if (imageNewBuffer) {
                        webpFilesArray.push({
                            fieldname: file.fieldname,
                            originalname: `${file.originalname}.webp`,
                            encoding: file.encoding,
                            mimetype: file.mimetype,
                            buffer: imageNewBuffer,
                            size: file.size,
                        });
                    }
                }
                else {
                    webpFilesArray.push(file);
                }

            }
            // console.log(webpFilesArray,"webfilesss")
            if (webpFilesArray?.length > 0) {
                let filesResponse = await uploadToS3(webpFilesArray);
                // console.log(filesResponse, "fileresponse")
                return resolve(
                    showResponse(
                        true,
                        ResponseMessages?.common?.file_upload_success,
                        filesResponse,
                        null,
                        200
                    )
                );
            }
            // console.log(webpFilesArray, "webpFiles")
            return resolve(
                showResponse(
                    false,
                    ResponseMessages?.common?.file_upload_error,
                    null,
                    null,
                    200
                )
            );
        } catch (err) {
            console.log(`in catch error 472`, err);
            return resolve(
                showResponse(
                    false,
                    ResponseMessages?.common?.file_upload_error,
                    err,
                    null,
                    200
                )
            );
        }
    });
};
const uploadToS3ExcelSheet = async (excelBuffer, fileName) => {
    return new Promise(async (resolve, reject) => {
        try {
            let SecretResponse = await getSecretFromAWS("mww-secret");
            let region = await getParameterFromAWS({ name: "REGION" });

            const s3 = new AWS.S3({
                accessKeyId: await getParameterFromAWS({ name: "ACCESSID" }),
                secretAccessKey: JSON.parse(SecretResponse?.SecretString)['mww-secret'],
                region,
            });

            let bucketName = await getParameterFromAWS({ name: `MWW-BUCKET` });
            bucketName = bucketName + `${changeEnv(process.env.ENV_MODE).bucket}`

            const params = {
                Bucket: bucketName,
                ContentType: 'application/xlsx',
                Key: fileName,
                Body: excelBuffer
            };
            s3.upload(params, (error, data) => {
                if (error) {
                    resolve(null)
                } else {
                    resolve(data.key ? data?.key : data.Key);
                }
            });
        } catch (err) {
            resolve({ status: false, message: 'Error Occured!!', data: err.message, code: 200 });
        }
    });
}


const uploadToS3 = async (files, key) => {
    try {
        // console.log(files, "filessss uploadToS3 side");
        let SecretResponse = await getSecretFromAWS("mww-secret");
        let region = await getParameterFromAWS({ name: "REGION" });

        const s3 = new AWS.S3({
            accessKeyId: await getParameterFromAWS({ name: "ACCESSID" }),
            secretAccessKey: JSON.parse(SecretResponse?.SecretString)['mww-secret'],
            region,
        });

        let bucketName = await getParameterFromAWS({ name: `MWW-BUCKET` });
        bucketName = bucketName + `${changeEnv(process.env.ENV_MODE).bucket}`

        const s3UploadPromises = files.map(async (file) => {
            return new Promise((resolve, reject) => {
                const bufferImage = key ? file : file.buffer;
                const ext = path.extname(
                    file?.originalname,
                    file?.fieldname,
                    file?.mimetype
                );
                let fileName = "";
                console.log(file.mimetype, "mimeeee");
                if (file?.mimetype?.indexOf("image" && !file.originalname.endsWith(".psd")) >= 0) {
                    // image file
                    fileName = `${file.fieldname}-${Date.now().toString()}.webp`;
                } else {
                    fileName = `${file.fieldname}-${Date.now().toString()}${ext}`;
                }
                fileName = `${file.fieldname}-${Date.now().toString()}${ext}`;
                const params = {
                    Bucket: bucketName,
                    ContentType: file?.mimetype?.indexOf("image" && !file.originalname.endsWith(".psd")) >= 0 ? "image/webp" : file?.mimetype,
                    Key: `${file.fieldname}/${fileName}`,
                    Body: bufferImage,
                };
                s3.upload(params, (error, data) => {
                    if (error) {
                        console.log("bucketerror", error);
                        resolve(null);
                    } else {
                        console.log("bucketdata", data);
                        resolve(data.Key || data.key);
                    }
                });
            });
        });
        const s3UploadResults = await Promise.all(s3UploadPromises);
        return s3UploadResults;

    } catch (error) {
        console.log(error, "errorrr s3upload")
        return error
    }
};



const generateUsernames = (name, count, all_usernames = null) => {
    const usernames = [];
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < count; i++) {
        let username = name;
        for (let j = 0; j < 4; j++) {
            username += chars[Math.floor(Math.random() * chars.length)];
        }
        if (all_usernames) {
            let idx = all_usernames?.findIndex((it) => it.username == username);
            if (idx < 0) {
                usernames.push(username);
            }
        } else {
            usernames.push(username);
        }
    }
    return usernames;
};
const getFileType = {
    'pdf': 1,
    'psd': 2,
    'ai': 3

}
// const uploadVideoToS31 = async (files) => {
//   try {
//     let SecretResponse = await getSecretFromAWS("rico-secret");
//     let region = await getParameterFromAWS({ name: "REGION" });
//     const s3 = new AWS.S3({
//       accessKeyId: await getParameterFromAWS({ name: "ACCESSID" }),
//       secretAccessKey: SecretResponse?.SecretString,
//       region,
//     });
//     let fileName = Date.now().toString() + Math.floor(Math.random() * 1000);
//     const VideoOutputBucket = await getParameterFromAWS({
//       name: "VideoOutputBucket",
//     });
//     return new Promise(async (resolve, reject) => {
//       if (files) {
//         let fileExt = ".mp4";
//         const ElasticTranscoder = new AWS.ElasticTranscoder({
//           region,
//           apiVersion: "2012-09-25",
//         });
//         let VideoInputBucket = await getParameterFromAWS({
//           name: "VideoInputBucket",
//         });
//         let filePath = fileName + fileExt;
//         var params = {
//           Bucket: VideoInputBucket,
//           ContentType: ".mp4",
//           Key: filePath,
//           Body: files,
//         };
//         s3.upload(params, async (error, data) => {
//           if (error) {
//             console.log("file upload to s3 error", error);
//             return resolve(null);
//           }
//           // console.log(params)
//           // Set the pipeline ID and output prefix
//           const PipeLineId = await getParameterFromAWS({ name: "PipeLineId" });
//           const OutputKeyPrefix = `${data?.Key.split(".")[0]}/`;
//           // Set the output parameters
//           const outputs = [
//             {
//               Key: OutputKeyPrefix + "hls_400k",
//               PresetId: "1351620000001-200050",
//               SegmentDuration: "10",
//             },
//             {
//               Key: OutputKeyPrefix + "hls_1m",
//               PresetId: "1351620000001-200030",
//               SegmentDuration: "10",
//             },
//             {
//               Key: OutputKeyPrefix + "hls_2m",
//               PresetId: "1351620000001-200010",
//               SegmentDuration: "10",
//             },
//           ];
//           // Set the input parameters
//           const input = {
//             Key: data?.Key,
//           };
//           // Set the job parameters
//           const params = {
//             PipelineId: PipeLineId,
//             Input: input,
//             Outputs: outputs,
//           };
//           // Create the transcoding job
//           await ElasticTranscoder.createJob(params).promise();
//           // Get the URLs of the transcoded files
//           const VideoBase = await getParameterFromAWS({ name: "VideoBase" });
//           const hls400kUrl = `${VideoBase}${OutputKeyPrefix}hls_400k.m3u8`;
//           const hls1mUrl = `${VideoBase}${OutputKeyPrefix}hls_1m.m3u8`;
//           const hls2mUrl = `${VideoBase}${OutputKeyPrefix}hls_2m.m3u8`;
//           // Create the playlist string
//           const playlistString =
//             "#EXTM3U\n" +
//             "#EXT-X-VERSION:3\n" +
//             "#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=640x360\n" +
//             hls400kUrl +
//             "\n" +
//             "#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=960x540\n" +
//             hls1mUrl +
//             "\n" +
//             "#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1280x720\n" +
//             hls2mUrl +
//             "\n";
//           // Create playlist.m3u8 file
//           const playlistParams = {
//             Bucket: VideoOutputBucket,
//             Key: `${OutputKeyPrefix}playlist.m3u8`,
//             ContentType: "application/x-mpegURL",
//             Body: playlistString,
//           };
//           await s3.putObject(playlistParams).promise();
//           resolve({ video_url: playlistParams.Key });
//         });
//       } else {
//         resolve(null);
//       }
//       // const s3UploadResults = await Promise.all(s3UploadPromises);
//       // let video_url = null
//       // s3UploadResults?.map((resp) => {
//       //     if (resp && resp?.video_url) {
//       //         video_url = resp?.video_url
//       //     }
//       // })
//       // if (video_url) {
//       //     return showResponse(true, ResponseMessages?.common?.file_upload_success, video_url, null, 200)
//       // }
//       // return showResponse(false, ResponseMessages?.common?.file_upload_error, null, null, 200)
//     });
//     //})
//   } catch (err) {
//     console.log(`Error creating transcoding job`, err);
//     return showResponse(
//       false,
//       ResponseMessages?.common?.file_upload_error,
//       err,
//       null,
//       200
//     );
//   }
// };

module.exports = {
    showResponse,
    showOutput,
    randomStr,
    validateParams,
    validateParamsArray,
    dynamicSort,
    validateEmail,
    arraySort,
    groupArray,
    sendFcmNotification,
    sendFcmNotificationMultiple,
    capitalize,
    getDistanceFromLatLonInKm,
    Comma_seprator,
    generateRandomKey,
    postParameterToAWS,
    getParameterFromAWS,
    getSecretFromAWS,
    sendEmailService,
    sendSMSService,
    uploadVideoToS3,
    uploadFileToS3,
    convertImageToWebp,
    exportExcel,
    sendExcelAttachement,
    // createVideoThumbnail,
    addToMulter,
    generateUsernames,
    // uploadAudioToS3,
    sendFcmNotificationTopic,
    // uploadVideoToS31,
    changeEnv,
    generateCsrfToken,
    generateIDs,
    getCurrentDate,
    validationError,
    generateUniqueCustomerId,
    generatePaytraceId,
    generatePayTraceToken,
    getFileType,
    updatePaytraceInfo,
    // generateRandom4DigitNumber,
    generateOrderID,
    addProductToShopify,
    addProductVarientToShopify,
    mongoError
};

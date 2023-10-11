var FCM = require("fcm-node");
const AWS = require("aws-sdk");
const mime = require('mime-types')
AWS.config.update({
    region: "us-east-1",
    credentials: new AWS.SharedIniFileCredentials({ profile: "default" }),
});
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
// const showOutputNew = (res, response, code) => {
//   // console.log(response,"response new output")
//   if (!response.status) {
//     res.status(code).json({
//       Response: {
//         Message: response?.Message,
//         ValidationErrors: null,
//         ValidationFailed: false,
//       }, StatusCode: response.code
//     });

//   } else {
//     // console.log(response?.data,"else shownew")
//     res.status(code).json({ message: response?.Message, response: response?.data, statusCode: response.code });

//   }
// };
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
function generateUniquePayTraceID() {
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
    customerIDCount = 1000 + customerIDCount + 1;

    // Generate the customer ID (4-digit number)
    const customerID = customerIDCount.toString().padStart(4, '0');

    // Increment the customer ID count
    customerIDCount++;

    // Generate the ID (4-digit number)
    const idNumber = customerIDCount.toString().padStart(4, '0');

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
    return moment().format('YYYY-MM-DDTHH:mm:ss.SSSSSS')
}

//
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
    limits:{ fileSize: 5 * 1048576 }, // 5 mb
})

// const uploadVideoToS3 = async (files) => {
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
//     const s3UploadPromises = files?.map(async (file) => {
//       return new Promise(async (resolve, reject) => {
//         if (file?.mimetype.indexOf("image") >= 0) {
//           let imageNewBuffer = await convertImageToWebp(file?.buffer);
//           if (imageNewBuffer) {
//             const params = {
//               Bucket: VideoOutputBucket,
//               ContentType: "image/webp",
//               Key: fileName + "/" + fileName + ".webp",
//               Body: imageNewBuffer,
//             };
//             s3.upload(params, (error, data) => {
//               if (error) {
//                 console.log("bucketerror", error);
//                 resolve(null);
//               } else {
//                 resolve({ thumb_url: data.key });
//               }
//             });
//           }
//         } else if (file?.mimetype.indexOf("video") >= 0) {
//           let fileExt = path.extname(file?.originalname);
//           const ElasticTranscoder = new AWS.ElasticTranscoder({
//             region,
//             apiVersion: "2012-09-25",
//           });
//           let VideoInputBucket = await getParameterFromAWS({
//             name: "VideoInputBucket",
//           });
//           let filePath = fileName + fileExt;
//           const params = {
//             Bucket: VideoInputBucket,
//             ContentType: file?.mimetype,
//             Key: filePath,
//             Body: file?.buffer,
//           };
//           s3.upload(params, async (error, data) => {
//             if (error) {
//               console.log("file upload to s3 error", error);
//               return resolve(null);
//             }
//             // Set the pipeline ID and output prefix
//             const PipeLineId = await getParameterFromAWS({
//               name: "PipeLineId",
//             });
//             const OutputKeyPrefix = `${data?.Key.split(".")[0]}/`;
//             // Set the output parameters
//             const outputs = [
//               {
//                 Key: OutputKeyPrefix + "hls_400k",
//                 PresetId: "1351620000001-200050",
//                 SegmentDuration: "10",
//               },
//               {
//                 Key: OutputKeyPrefix + "hls_1m",
//                 PresetId: "1351620000001-200030",
//                 SegmentDuration: "10",
//               },
//               {
//                 Key: OutputKeyPrefix + "hls_2m",
//                 PresetId: "1351620000001-200010",
//                 SegmentDuration: "10",
//               },
//             ];
//             // Set the input parameters
//             const input = {
//               Key: data?.Key,
//             };
//             // Set the job parameters
//             const params = {
//               PipelineId: PipeLineId,
//               Input: input,
//               Outputs: outputs,
//             };
//             // Create the transcoding job
//             await ElasticTranscoder.createJob(params).promise();
//             // Get the URLs of the transcoded files
//             const VideoBase = await getParameterFromAWS({ name: "VideoBase" });
//             const hls400kUrl = `${VideoBase}${OutputKeyPrefix}hls_400k.m3u8`;
//             const hls1mUrl = `${VideoBase}${OutputKeyPrefix}hls_1m.m3u8`;
//             const hls2mUrl = `${VideoBase}${OutputKeyPrefix}hls_2m.m3u8`;
//             // Create the playlist string
//             const playlistString =
//               "#EXTM3U\n" +
//               "#EXT-X-VERSION:3\n" +
//               "#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=640x360\n" +
//               hls400kUrl +
//               "\n" +
//               "#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=960x540\n" +
//               hls1mUrl +
//               "\n" +
//               "#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1280x720\n" +
//               hls2mUrl +
//               "\n";
//             // Create playlist.m3u8 file
//             const playlistParams = {
//               Bucket: VideoOutputBucket,
//               Key: `${OutputKeyPrefix}playlist.m3u8`,
//               ContentType: "application/x-mpegURL",
//               Body: playlistString,
//             };
//             await s3.putObject(playlistParams).promise();
//             resolve({ video_url: playlistParams.Key });
//           });
//         } else {
//           resolve(null);
//         }
//       });
//     });
//     const s3UploadResults = await Promise.all(s3UploadPromises);
//     let video_url = null;
//     s3UploadResults?.map((resp) => {
//       if (resp && resp?.video_url) {
//         video_url = resp?.video_url;
//       }
//     });
//     if (video_url) {
//       return showResponse(
//         true,
//         ResponseMessages?.common?.file_upload_success,
//         video_url,
//         null,
//         200
//       );
//     }
//     return showResponse(
//       false,
//       ResponseMessages?.common?.file_upload_error,
//       null,
//       null,
//       200
//     );
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

// using ffmpeg and its too much time
// const createVideoThumbnail = async (videoFileName, fileExt) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let SecretResponse = await getSecretFromAWS("rico-secret");
//       let region = await getParameterFromAWS({ name: "REGION" });
//       const s3 = new AWS.S3({
//         accessKeyId: await getParameterFromAWS({ name: "ACCESSID" }),
//         secretAccessKey: SecretResponse?.SecretString,
//         region,
//       });
//       let VideoInputBucket = await getParameterFromAWS({
//         name: "VideoInputBucket",
//       });
//       const inputFileName = `${videoFileName}${fileExt}`;
//       const outputFileName = `${videoFileName}-thumbnail.jpg`;
//       const stream = s3
//         .getObject({ Bucket: VideoInputBucket, Key: inputFileName })
//         .createReadStream();
//       ffmpeg(stream)
//         .screenshots({
//           count: 1,
//           filename: outputFileName,
//           folder: "/tmp",
//           timemarks: ["4"],
//         })
//         .on("end", async () => {
//           // Upload the thumbnail to S3
//           const thumbnailPath = `/tmp/${outputFileName}`;
//           const thumbnailFileContent = fs.readFileSync(thumbnailPath);
//           const thumbnailUploadParams = {
//             Bucket: await getParameterFromAWS({ name: "VideoOutputBucket" }),
//             Key: `${videoFileName}/${outputFileName}`,
//             Body: thumbnailFileContent,
//           };
//           s3.upload(thumbnailUploadParams, (err, data) => {
//             if (err) {
//               return resolve(
//                 showResponse(
//                   false,
//                   ResponseMessages?.common?.thumbnail_error,
//                   err,
//                   null,
//                   200
//                 )
//               );
//             }
//             return resolve(
//               showResponse(
//                 true,
//                 ResponseMessages?.common?.thumbnail_generated,
//                 data,
//                 null,
//                 200
//               )
//             );
//           });
//         })
//         .on("error", (err) => {
//           return resolve(
//             showResponse(
//               false,
//               ResponseMessages?.common?.thumbnail_error,
//               err,
//               null,
//               200
//             )
//           );
//         });
//     } catch (err) {
//       return resolve(
//         showResponse(
//           false,
//           ResponseMessages?.common?.thumbnail_error,
//           err,
//           null,
//           200
//         )
//       );
//     }
//   });
// };


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
    // console.log(files, "filess")
    return new Promise(async (resolve, reject) => {
        try {
            let webpFilesArray = [];
            for (let i = 0; i < files?.length; i++) {
                let file = files[i];
                let mime_type = file?.mimetype.split("/")[0];
                console.log(mime_type, "mime_typemime_type")
                if (mime_type == "image" && !file.originalname.endsWith(".psd")) {
                    let imageNewBuffer = await convertImageToWebp(file?.buffer);

                    if (imageNewBuffer) {
                        console.log(file.originalname, "file.originalname")
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
                if (file?.mimetype?.indexOf("image" && !file.originalname.endsWith(".psd")) >= 0) {
                    // image file
                    fileName = `${file.fieldname}-${Date.now().toString()}.webp`;
                } else {
                    fileName = `${file.fieldname}-${Date.now().toString()}${ext}`;
                }
                const params = {
                    Bucket: bucketName,
                    ContentType:
                        file?.mimetype?.indexOf("image" && !file.originalname.endsWith(".psd")) >= 0 ? "image/webp" : file?.mimetype,
                    Key: `${file.fieldname}/${fileName}`,
                    Body: bufferImage,
                };
                s3.upload(params, (error, data) => {
                    if (error) {
                        console.log("bucketerror", error);
                        resolve(null);
                    } else {
                        // console.log("bucketdata", data);
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


// Function to convert PSD and AI to compressed image format (e.g., JPEG)
async function convertPsdAiToImage(buffer) {
    try {
        console.log(buffer, "bufferrs")
        // Use sharp or another library to convert PSD/AI to JPEG
        const compressedImageBuffer = await sharp(buffer)
            .jpeg({ quality: 80 }) // Adjust quality as needed
            .toBuffer();

        return compressedImageBuffer;
    } catch (error) {
        console.error('Error converting PSD/AI to image:', error);
        return null;
    }
}
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
    // uploadVideoToS3,
    uploadFileToS3,
    convertImageToWebp,
    // createVideoThumbnail,
    addToMulter,
    generateUsernames,
    // uploadAudioToS3,
    sendFcmNotificationTopic,
    // uploadVideoToS31,
    changeEnv,
    // showOutputNew,
    generateIDs,
    getCurrentDate,
    validationError,
    generateUniquePayTraceID,
    getFileType,
    mongoError
};

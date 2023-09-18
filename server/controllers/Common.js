var Common = require('../utils/Common');
var helpers = require('../services/helper')
const ResponseMessages = require("../constants/ResponseMessages")
const videoMulterRef = helpers.addToMulter.array('rico_video')
const fileMulterRef = helpers.addToMulter.array('rico_file')
const { exec } = require('child_process');

const upload = require('../services/upload')
const addText = upload.any('rico_video');
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs =require('fs')
const addTextVideo = async(filename,data) => {
    return new Promise((resolve, reject) => {
    const outputPath = path.join(__dirname, '../uploads/'+Date.now()+".mp4");
    const text = 'Your Text Here';
    const textX = '(w-text_w)/2';
    const textY = 'h-text_h-10';
    const fontSize = 24;
    const fontColor = 'white';
    console.log(data)
    // data= JSON.parse(data)
    let mapoverlay = JSON.parse(data?.mapoverlay);
  // Add text overlay using FFmpeg
//   ffmpeg()
//     .input(filename)
//     .complexFilter([
//       {
//         filter: 'drawtext',
//         options: {
//           text: text,
//           x: textX,
//           y: textY,
//           fontsize: fontSize,
//           fontcolor: fontColor,
//         },
//       },
//     ])
//     .on('end', async(response) => {
//       console.log('Text added to the video.',response);
//       const thumbnailFileContent = fs.readFileSync(outputPath);
//          const a= await helpers.uploadVideoToS31(thumbnailFileContent)
//          fs.unlink(filename, (err) => {
//             if (err) {
//               console.error('Error deleting the file:', err);
//               return;
//             }
          
//             console.log('File deleted successfully');
//           });
//          resolve({status:true,message:"Video create successfully",data:a});

//     })
//     .on('error', (err) => {
//       console.error('Error:', err);
//     })
//     .save(outputPath);

// const textOverlays = [
//     {
//       text: 'Text Overlay 1',
//       x: '(w-text_w)/2',
//       y: 'h-50',
//       fontsize: 24,
//       fontcolor: 'white',
//     },
//     // {
//     //   text: 'Text Overlay 2',
//     //   x: '20',
//     //   y: 'h-100',
//     //   fontsize: 24,
//     //   fontcolor: 'red',
//     // },
//     // Add more text overlay objects as needed
//   ];
  
//   const ffmpegCommand = ffmpeg();
  
//   // Add each text overlay to the FFmpeg command
//   textOverlays.forEach((textOverlay) => {
//     ffmpegCommand.complexFilter([
//       {
//         filter: 'drawtext',
//         options: textOverlay,
//       },
//     ]);
//   });
  
//   ffmpegCommand
//     .input(filename)
//     .videoCodec('libx264')
//     .audioCodec('aac')
//     .on('end', () => {
//       console.log('Text overlays added to the video.');
//     })
//     .on('error', (err) => {
//       console.error('Error:', err);
//     })
//     .save(outputPath);


const textOverlays = [
    {
      text: 'Text Overlay 1',
      x: '(w-text_w)/2',
      y: 'h-th-10',
      fontsize: 24,
      fontcolor: 'white',
    },
    {
      text: 'Text Overlay 2',
      x: '(w-text_w)/2',
      y: 'h-th-40',
      fontsize: 24,
      fontcolor: 'red',
    },
    // Add more text overlay objects as needed
  ];

  const filters = mapoverlay.map((overlay) => {
    return `drawtext=text='${overlay.text}':x=${overlay.x}:y=${overlay.y}:fontsize=${overlay.fontsize}:fontcolor=${overlay.fontcolor}`;
  });
  
  const filterString = filters.join(',');
  
  const ffmpegCommand = `ffmpeg -i ${filename} -vf "${filterString}" ${outputPath}`;
  
  exec(ffmpegCommand, async(error, stdout, stderr) => {
    if (error) {
      console.error('Error:', error);
      return;
    }
    console.log('Text added to the video.');
    const thumbnailFileContent = fs.readFileSync(outputPath);
             const a= await helpers.uploadVideoToS31(thumbnailFileContent)
             fs.unlink(filename, (err) => {
                if (err) {
                  console.error('Error deleting the file:', err);
                  return;
                }
              
                console.log('File deleted successfully');
              });
             resolve({status:true,message:"Video create successfully",data:a});
    
  });
  
  
//   const ffmpegCommand = ffmpeg().input(filename);
  
//   // Apply each text overlay in the array
//   textOverlays.forEach((overlay, index) => {
//     ffmpegCommand.complexFilter([
//       {
//         filter: 'drawtext',
//         options: overlay,
//       },
//     ]);
//   });
  
//   // Save the modified video
//   ffmpegCommand
//     .toFormat('mp4')
//     .on('end', () => {
//       console.log('Text overlays added to the video.');
//     })
//     .on('error', (err) => {
//       console.error('Error:', err);
//     })
//     .save(outputPath);
    });
  };
const commonController = {

    getTermsContent: async (req, res) => {
        let result = await Common.getTermsContent();
        return helpers.showOutput(res, result, result.code);
    },

    getPrivacyContent: async (req, res) => {
        let result = await Common.getPrivacyContent();
        return helpers.showOutput(res, result, result.code);
    },
    
    getAbout: async (req, res) => {
        let result = await Common.getAbout();
        return helpers.showOutput(res, result, result.code);
    },

    getQuestions: async (req, res) => {
        let result = await Common.getQuestions();
        return helpers.showOutput(res, result, result.code);
    },

    storeParameterToAWS: async (req, res) => {
        let requiredFields = ['name', 'value'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.Message), 203);
        }
        let result = await Common.storeParameterToAWS(req.body);
        return helpers.showOutput(res, result, result.code);
    },
    fetchParameterFromAWS: async (req, res) => {
        let requiredFields = ['name'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.Message), 203);
        }
        let result = await Common.fetchParameterFromAWS(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    addNewQuestion: async (req, res) => {
        let requiredFields = ['question', 'answer'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Common.addNewQuestion(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    updateQuestion: async (req, res) => {
        let requiredFields = ['ques_id'];
        let validator = helpers.validateParams(req, requiredFields);
        if (!validator.status) {
            return helpers.showOutput(res, helpers.showResponse(false, validator.message), 203);
        }
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Common.updateQuestion(req.body, req.body.ques_id);
        return helpers.showOutput(res, result, result.code);
    },
    
    getCommonData: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Common.getCommonData();
        return helpers.showOutput(res, result, result.code);
    },

    updateCommonData: async (req, res) => {
        let admin_id = req.decoded.admin_id;
        if (!admin_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 403);
        }
        let result = await Common.updateCommonData(req.body);
        return helpers.showOutput(res, result, result.code);
    },

    uploadVideoToS3: async (req, res) => {
        videoMulterRef(req, res, async (err) => {
            if(err || !req.files) {
                return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.common?.no_video_file), 203);
            }
            let result = await helpers.uploadVideoToS3(req.files)
            return helpers.showOutput(res, result, result.code);
        })
    },

    uploadFileToS3: async (req, res) => {
        fileMulterRef(req, res, async (err) => {
            if(err || !req.files) {
                return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.common?.no_file), 203);
            }
            let result = await helpers.uploadFileToS3(req.files)
            return helpers.showOutput(res, result, result.code);
        })
    },

    addTextOnVideo:async(req,res)=>{
        console.log(req.body)
        addText(req,res,async(err)=>{
            if(err || !req.files) {
                return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.common?.no_file), 203);
            }
            let arr=[]
            
            if(req.files.length>0){
                for(let val of req.files){
                    var result=  await addTextVideo(val.path,req.body)
                   // arr.push(result)
                }
                return helpers.showOutput(res, result, 200);

            }

        })
    }
}

module.exports = {
    ...commonController
}
const fs = require('fs.promises');

const deleteFile = async function(filePath){
    await fs.unlink(filePath);
};
const readFile = async function(filePath){
    try {
    // return fs.readFileSync(filePath)
    fs.readFile(filePath, 'utf8', function(err, data){
      
        // Display the file content
        console.log(data,"fs read side ");
        return data
    });
        
    } catch (error) {
        console.log(error,"error file path file system side ")
    }
    
}
const readDirectory = async function (directoryPath) {
    return await fs.readdir(directoryPath);
}
const makeDirectory = async function (directoryPath) {
    return await fs.mkdir(directoryPath,{ recursive: true });
}
const deleteDirectory = async function (directoryPath) {
    let files = await fs.readdir(directoryPath);
    for (const file of files) {
      await deleteFile(`${directoryPath}/${file}`);
    }
    await fs.rmdir(directoryPath);
};
module.exports = {
    deleteDirectory,
    readDirectory,
    makeDirectory,
    deleteFile,
    readFile
}
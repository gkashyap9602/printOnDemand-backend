const helpers = require('../services/helper/index')
const path = require('path')
const productQueue = helpers.generateQueue('productQueue')

productQueue.process(path.join(__dirname, 'productQueueProcess.js'))

productQueue.on('completed', (job) => {
    console.log(`Completed ${job.id}`);
})

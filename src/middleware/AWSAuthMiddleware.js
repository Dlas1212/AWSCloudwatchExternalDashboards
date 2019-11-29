require('dotenv').config()
var AWS = require('aws-sdk'); 

module.exports = (req, res, next) => {

    const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env
  
    if (!AWS_ACCESS_KEY || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
        throw new Error('AWS ACCESS KEYS DO NOT EXIST')
    }

    AWS.config = new AWS.Config();
    AWS.config.accessKeyId = AWS_ACCESS_KEY
    AWS.config.secretAccessKey = AWS_SECRET_ACCESS_KEY
    AWS.config.region = AWS_REGION

    next()
  
}
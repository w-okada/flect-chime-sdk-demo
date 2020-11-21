
var utils   = require('./utils')
var AWS = require('aws-sdk');

exports.connect = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    const response = utils.getResponseTemplate()
    callback(null, response)
}
exports.disconnect = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    const response = utils.getResponseTemplate()
    callback(null, response)
}
exports.message = async (event, context, callback) => {
    console.log(event)
    console.log(context)
    console.log(callback)
    const response = utils.getResponseTemplate()
    callback(null, response)
}
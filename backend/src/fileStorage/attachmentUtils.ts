import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'

//const AWSXRay = require('aws-xray-sdk')
//const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

//const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export function getAttachmentUrl(attachmentId: string): string {
  return `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
}

export function getUploadUrl(attachmentId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachmentId,
    Expires: parseInt(urlExpiration)
  })
}